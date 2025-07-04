import { SocketEvents } from "@/constants/socketEvents";
import { getAiResponse } from "../utils/ai";
import { createMessageDb } from "../db/message.db";
import { emitInAppNotification } from "@/domains/socket/socketService";
import { AiResponse, supportedLanguage } from "@/services/types";
import { Server } from "socket.io";
import { PrismaClient, User } from "@/generated/prisma/client";
import { DbTx } from "@/lib/prisma";
import { sendNewMessagePushNotification } from "@/domains/notification/service";
import { ChatErrors } from "@/domains/shared/errors";
import { logger } from "@/lib/logger";

type SendMessageInput = {
  roomId: string;
  content: string;
};

type SendMessageArgs = {
  input: SendMessageInput;
  user: Pick<User, "id" | "displayName">;
  prisma: DbTx;
  io: Server;
  isSystemMessage?: boolean;
};

// Transaction-agnostic core function
export const sendMessageTx = async ({
  input,
  user,
  prisma,
  io,
  isSystemMessage = false,
}: SendMessageArgs) => {
  const { roomId, content } = input;
  const { id: senderId, displayName } = user;

  let finalMessageContent = content;
  let suggestion: AiResponse | null = null;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { topic: true, name: true },
  });

  if (!room) {
    throw ChatErrors.ROOM_NOT_FOUND;
  }

  // Run AI moderation (if not system message)
  const skipApiCheck =
    process.env.NODE_ENV === "development" || isSystemMessage;
  if (!skipApiCheck) {
    const aiResponse = await getAiResponse(
      content,
      room.topic as supportedLanguage
    );
    if (aiResponse && !aiResponse.isMessageOk) {
      suggestion = aiResponse;
      finalMessageContent = aiResponse.fixedMessage;
    }
  }

  const dbTx = createMessageDb({ prisma, user, roomId });

  const message = await dbTx.createMessage(finalMessageContent, suggestion);
  const membersId = await dbTx.createMessageStatuses(message.id);
  await dbTx.updateRoomLastMessage(finalMessageContent, isSystemMessage);

  // Notify members (except sender or system)

  for (const memberId of membersId) {
    if (memberId !== senderId && senderId !== "SYSTEM") {
      emitInAppNotification({
        io,
        userId: memberId,
        data: {
          message: isSystemMessage
            ? finalMessageContent
            : `${displayName}: ${finalMessageContent}`,
          displayName,
          roomName: room.name,
          roomId,
        },
      });

      if (!isSystemMessage) {
        logger.info("Sending push notifications to", { memberId });
        sendNewMessagePushNotification({
          userId: memberId,
          title: room.name?.trim() || "New message",
          body: isSystemMessage
            ? finalMessageContent
            : `${displayName}: ${finalMessageContent}`,
          data: { roomId, type: "chat" },
        });
      }
    }
  }

  // Emit to socket
  io.to(roomId).emit(SocketEvents.NEW_MESSAGE, {
    ...message,
    createdAt: message.createdAt.toISOString(),
  });

  return message;
};

// Wrapper for standalone use with internal transaction
export const sendMessageService = async (
  args: Omit<SendMessageArgs, "prisma"> & { prisma: PrismaClient }
) => {
  return await args.prisma.$transaction(async (tx) =>
    sendMessageTx({ ...args, prisma: tx })
  );
};

export const getMessageService = async ({ ctx }) => {
  const { userId, prisma } = ctx;
  return {
    deleteMessages: async (input: { roomId: string }) => {
      const { roomId } = input;
      if (!userId) throw new Error("Not authenticated");

      const membership = await prisma.roomMember.findFirst({
        where: { userId, roomId: input.roomId },
      });

      if (!membership) {
        throw ChatErrors.NOT_A_MEMBER;
      }

      const messages = await prisma.message.findMany({
        where: { roomId },
        select: { id: true },
      });

      const updates = await Promise.all(
        messages.map(({ id }) =>
          prisma.messageStatus.upsert({
            where: {
              messageId_userId: {
                messageId: id,
                userId,
              },
            },
            update: {
              isDeleted: true,
              deletedAt: new Date(),
            },
            create: {
              messageId: id,
              userId,
              isDeleted: true,
              deletedAt: new Date(),
            },
          })
        )
      );
      return !!updates.length;
    },
  };
};

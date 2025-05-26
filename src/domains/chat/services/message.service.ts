import { SocketEvents } from "@/constants/socketEvents";
import { getAiResponse } from "../utils/ai";
import { createMessageDb } from "../db/message.db";
import { emitInAppNotification } from "@/domains/socket/socketService";
import { AiResponse, supportedLanguage } from "@/services/types";
import { Server } from "socket.io";
import { Prisma, PrismaClient, User } from "@/generated/prisma/client";
import { DbTx } from "@/lib/prisma";


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
    throw new Error(`Room not found: ${roomId}`);
  }

  // Run AI moderation (if not system message)
  if (!isSystemMessage) {
    const aiResponse = await getAiResponse(content, room.topic as supportedLanguage);
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
  membersId.forEach((memberId) => {
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
    }
  });

  // Emit to socket
  io.to(roomId).emit(SocketEvents.NEW_MESSAGE, {
    ...message,
    createdAt: message.createdAt.toISOString(),
  });

  return message;
};

// Wrapper for standalone use with internal transaction
export const sendMessageService = async (args: Omit<SendMessageArgs, "prisma"> & { prisma: PrismaClient }) => {
  try {
    return await args.prisma.$transaction(async (tx) =>
      sendMessageTx({ ...args, prisma: tx })
    );
  } catch (error) {
    throw new Error(`sendMessageService failed: ${error.message}`);
  }
};
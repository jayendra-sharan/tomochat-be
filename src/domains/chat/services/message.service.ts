import { groqAi } from "@/services";
import { sendUserNotification } from "@/domains/notification/service";
import { SocketEvents } from "@/constants/socketEvents";
import { getAiResponse } from "../utils/ai";
import { createMessageDb } from "../db/message.db";
import { logger } from "@/lib/logger";
import { getUserSockets } from "@/domains/socket/socketRegistry";
import { emitInAppNotification } from "@/domains/socket/socketService";

export const sendMessageService = async ({ input, user, prisma, io }) => {
  const { isPrivate, groupId, content } = input;
  const { id, displayName } = user;
  let aiReply = "";
  
  const lastMessage = isPrivate ? content : aiReply
  const suggestion = isPrivate ? null : await getAiResponse(input.content);


  const { message, membersId, name: roomName } = await prisma.$transaction(async (tx) => {
    const dbTx = createMessageDb({ prisma: tx, user, groupId });

    const message = await dbTx.createMessage(lastMessage, suggestion);
    const name = await dbTx.updateGroupLastMessage(lastMessage);
    const membersId = await dbTx.createMessageStatuses(message.id);
    return {
      name,
      message,
      membersId,
    };
  })

  // @todo to be implemented later.
  // sendUserNotification(userId, "New message", lastMessage, prisma);

  membersId.map(userId => {
    if (userId !== id) {
      logger.info("Not", userId);
      emitInAppNotification({
        io,
        userId,
        data: {
          message: lastMessage,
          displayName,
          roomName,
        }
      });
    }
  })

  io.to(input.groupId).emit(SocketEvents.NEW_MESSAGE, {
    ...message,
    createdAt: message.createdAt.toISOString(),
  });

  return message;
}
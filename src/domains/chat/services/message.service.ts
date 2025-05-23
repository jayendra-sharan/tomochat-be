import { SocketEvents } from "@/constants/socketEvents";
import { getAiResponse } from "../utils/ai";
import { createMessageDb } from "../db/message.db";
import { logger } from "@/lib/logger";
import { emitInAppNotification } from "@/domains/socket/socketService";

export const sendMessageService = async ({ input, user, prisma, io }) => {
  const { roomId, content } = input;
  const { id, displayName } = user;
  
  let lastMessage = content
  const aiResponse = await getAiResponse(input.content);
  let suggestion = null;

  if (aiResponse.issues.length) {
    suggestion = aiResponse;
    lastMessage = aiResponse.improved;
  }


  const { message, membersId, name: roomName } = await prisma.$transaction(async (tx) => {
    const dbTx = createMessageDb({ prisma: tx, user, roomId });

    const message = await dbTx.createMessage(lastMessage, suggestion);
    const name = await dbTx.updateRoomLastMessage(lastMessage);
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
      emitInAppNotification({
        io,
        userId,
        data: {
          message: lastMessage,
          displayName,
          roomName,
          roomId: roomId
        }
      });
    }
  })

  io.to(input.roomId).emit(SocketEvents.NEW_MESSAGE, {
    ...message,
    createdAt: message.createdAt.toISOString(),
  });

  return message;
}
import { groqAi } from "@/services";
import { sendUserNotification } from "@/domains/notification/service";
import { SocketEvents } from "@/constants/socketEvents";
import { getAiResponse } from "../utils/ai";
import { createMessageDb } from "../db/message.db";
import { logger } from "@/lib/logger";

export const sendMessageService = async ({ input, user, prisma, io }) => {
  const { isPrivate, groupId, content } = input;
  const { id, displayName } = user;
  let aiReply = "";
  
  const lastMessage = isPrivate ? content : aiReply
  const suggestion = isPrivate ? null : await getAiResponse(input.content);


  const { message, membersId, name: groupName } = await prisma.$transaction(async (tx) => {
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
      logger.info("Sending update", { lastMessage, senderDisplayName: displayName, groupName  });
    }
  })

  io.to(input.groupId).emit(SocketEvents.NEW_MESSAGE, {
    ...message,
    createdAt: message.createdAt.toISOString(),
  });

  return message;
}
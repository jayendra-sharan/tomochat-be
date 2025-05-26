import { DbTx } from "@/lib/prisma";
import { Suggestion } from "@/domains/shared/types";

type CreateMessageDbType = {
  prisma: DbTx;
  user: {id: string; displayName: string};
  roomId: string;
}

export function createMessageDb({
  prisma,
  user,
  roomId,
}: CreateMessageDbType) {
  const { id, displayName } = user;
  return {
    createMessage: async (content: string, suggestion?: Suggestion) => {
      try {
        return prisma.message.create({
          data: {
            content,
            senderId: id,
            roomId,
            suggestion
          },
          include: {
            sender: true,
            room: true,
          }
        });
      } catch (error) {
        throw new Error(`Error in message.db.ts:createMessage: ${error.message}`)
      }
    },
    updateRoomLastMessage: async (lastMessage: string, isSystemMessage: boolean = false) => {
      try {
        const room = await prisma.room.update({
          where: { id: roomId },
          data: {
            lastMessage: isSystemMessage ? lastMessage : `${displayName}: ${lastMessage}`,
          },
          select: {
            name: true,
          }
        });
        return room.name;
      } catch (error) {
        throw new Error(`Error in message.db.ts:updateRoomLastMessage: ${error.message}`)
      }
    },
    createMessageStatuses: async (messageId: string) => {
      try {
        const members = await prisma.roomMember.findMany({
          where: { roomId },
          select: { userId: true },
        });
  
        const membersId = members.map((m) => m.userId);
  
        await prisma.messageStatus.createMany({
          data: membersId.map((userId) => ({
            messageId,
            userId: userId,
            delivered: userId === id,
            isRead: userId === id,
            readAt: new Date()
          }))
        });
        return membersId;
      } catch (error) {
        throw new Error(`Error in message.db.ts:createMessageStatuses: ${error.message}`)
      }
    }
  }
}

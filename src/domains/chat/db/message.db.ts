import { PrismaClient } from "@/lib/prisma";
import { User } from "@/generated/prisma/client";
import { Suggestion } from "@/domains/shared/types";

type CreateMessageDbType = {
  prisma: PrismaClient;
  user: User;
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
    },
    updateRoomLastMessage: async (content: string) => {
      const room = await prisma.room.update({
        where: { id: roomId },
        data: {
          lastMessage: `${displayName}: ${content}`,
        },
        select: {
          name: true,
        }
      });
      return room.name;
    },
    createMessageStatuses: async (messageId: string) => {
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        select: { userId: true },
      });

      const membersId = members.map((m) => m.userId);

      await prisma.messageStatus.createMany({
        data: membersId.map((userId) => ({
          messageId,
          userId: userId,
          delivered: userId === id
        }))
      });
      return membersId;
    }
  }
}

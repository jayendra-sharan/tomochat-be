import { PrismaClient } from "@/lib/prisma";
import { User } from "@/generated/prisma/client";
import { Suggestion } from "@/domains/shared/types";

type CreateMessageDbType = {
  prisma: PrismaClient;
  user: User;
  groupId: string;
}

export function createMessageDb({
  prisma,
  user,
  groupId,
}: CreateMessageDbType) {
  const { id, displayName } = user;
  return {
    createMessage: async (content: string, suggestion?: Suggestion) => {

      return prisma.message.create({
        data: {
          content,
          senderId: id,
          groupId,
          suggestion
        },
        include: {
          sender: true,
          group: true,
        }
      });
    },
    updateGroupLastMessage: async (content: string) => {
      const group = await prisma.group.update({
        where: { id: groupId },
        data: {
          lastMessage: `${displayName}: ${content}`,
        },
        select: {
          name: true,
        }
      });
      return group.name;
    },
    createMessageStatuses: async (messageId: string) => {
      const members = await prisma.groupMember.findMany({
        where: { groupId },
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

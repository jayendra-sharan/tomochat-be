import { SocketEvents } from '@/constants/socketEvents';
import { sendUserNotification } from '@/domains/notification/service';
import { logger } from '@/lib/logger';
import { groqAi } from '@/services';
import { sendMessageService } from '../services/message.service';

export const messageResolvers = {
  Query: {
    groupMessages: async (_, { input }, { userId, prisma }) => {
      const { groupId } = input;
      if (!userId) {
        return "User not authenticated";
      }

      const membership = await prisma.groupMember.findFirst({
        where: { userId, groupId }
      });

      if (!membership) {
        return "You are not a member of this group";
      }

      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });


      const messages = await prisma.message.findMany({
        where: {
          groupId
        },
        include: {
          sender: true,
          group: true,
          perUserStatus: {
            select: {
              userId: true,
              isRead: true,
              isDeleted: true,
              delivered: true,
              readAt: true,
              deletedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        }
      });

      return {
        messages,
        name: group.name,
        id: groupId,
        userId
      }
    },
  },

  Mutation: {
    sendMessage: async (_, { input }, { user, io, prisma }) => {
      return sendMessageService({ input, user, prisma, io});
    },

    clearGroupMessages: async (_, { input }, { userId, prisma }) => {
      if (!userId) throw new Error("Not authenticated");

      const membership = await prisma.groupMember.findFirst({
        where: { userId, groupId: input.groupId },
      });

      if (!membership) throw new Error("You are not a member of this group");

      await prisma.message.deleteMany({ where: { groupId: input.groupId } });
      return true;
    },
  },
};

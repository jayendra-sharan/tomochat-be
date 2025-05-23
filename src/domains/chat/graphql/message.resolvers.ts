import { SocketEvents } from '@/constants/socketEvents';
import { sendUserNotification } from '@/domains/notification/service';
import { logger } from '@/lib/logger';
import { groqAi } from '@/services';
import { sendMessageService } from '../services/message.service';

export const messageResolvers = {
  Query: {
    roomMessages: async (_, { input }, { userId, prisma }) => {
      const { roomId } = input;
      if (!userId) {
        return "User not authenticated";
      }

      const membership = await prisma.roomMember.findFirst({
        where: { userId, roomId }
      });

      if (!membership) {
        return "You are not a member of this chat room";
      }

      const room = await prisma.room.findUnique({
        where: { id: roomId }
      });


      const messages = await prisma.message.findMany({
        where: {
          roomId
        },
        include: {
          sender: true,
          room: true,
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
        name: room.name,
        id: roomId,
        userId
      }
    },
  },

  Mutation: {
    sendMessage: async (_, { input }, { user, io, prisma }) => {
      return sendMessageService({ input, user, prisma, io});
    },

    clearRoomMessages: async (_, { input }, { userId, prisma }) => {
      if (!userId) throw new Error("Not authenticated");

      const membership = await prisma.roomMember.findFirst({
        where: { userId, roomId: input.roomId },
      });

      if (!membership) throw new Error("You are not a member of this chat room");

      await prisma.message.deleteMany({ where: { roomId: input.roomId } });
      return true;
    },
  },
};

import {
  AuthenticationError,
  AuthorizationError,
  ChatErrors,
} from "@/domains/shared/errors";
import {
  getMessageService,
  sendMessageService,
} from "../services/message.service";

export const messageResolvers = {
  Query: {
    roomMessages: async (_, { input }, { userId, prisma }) => {
      const { roomId } = input;
      if (!userId) {
        throw ChatErrors.USER_NOT_LOGGED_IN;
      }

      const membership = await prisma.roomMember.findFirst({
        where: { userId, roomId },
      });

      if (!membership) {
        throw ChatErrors.NOT_A_MEMBER;
      }

      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      const messages = await prisma.message.findMany({
        where: {
          roomId,
          perUserStatus: {
            none: {
              userId,
              isDeleted: true,
            },
          },
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
          createdAt: "asc",
        },
      });

      return {
        messages,
        name: room.name,
        id: roomId,
        userId,
      };
    },
  },

  Mutation: {
    sendMessage: async (_, { input }, { user, io, prisma }) => {
      return sendMessageService({ input, user, prisma, io });
    },

    clearRoomMessages: async (_, { input }, { userId, prisma }) => {
      if (!userId) throw new Error("Not authenticated");

      const membership = await prisma.roomMember.findFirst({
        where: { userId, roomId: input.roomId },
      });

      if (!membership) {
        throw ChatErrors.NOT_A_MEMBER;
      }

      await prisma.message.deleteMany({ where: { roomId: input.roomId } });
      return true;
    },
    deleteMessages: async (_, { input }, ctx) => {
      const messageService = await getMessageService({ ctx });
      return messageService.deleteMessages(input);
    },
  },
};

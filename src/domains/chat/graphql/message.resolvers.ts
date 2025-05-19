import { SocketEvents } from '@/constants/socketEvents';
import { logger } from '@/lib/logger';
import { groqAi } from '@/services';

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
    sendMessage: async (_, { input }, { userId, io, prisma }) => {
      const { isPrivate, groupId, content } = input;
      let aiReply = "";
      let suggestion = null;
      
      if (!isPrivate) {
        const response = await groqAi(input.content);
        const responseJson = JSON.parse(response);
        aiReply = responseJson.aiReply;
        suggestion = {
          original: content,
          ...responseJson,
        }
      }

      const lastMessage = isPrivate ? content : aiReply

      const message = await prisma.message.create({
        data: {
          content: lastMessage,
          senderId: userId,
          groupId: groupId,
          suggestion,
        },
        include: { sender: true, group: true },
      });

      await prisma.group.update({
        where: {
          id: groupId
        },
        data: {
          lastMessage: `${input.displayName}: ${lastMessage}`,
        }
      });

      io.to(input.groupId).emit(SocketEvents.NEW_MESSAGE, {
        ...message,
        createdAt: message.createdAt.toISOString(),
      });

      return message;
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

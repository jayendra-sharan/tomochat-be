import { registerToken } from '../service';

export const notificationResolvers = {
  Mutation: {
    registerPushToken: async (_, { input }, { prisma, userId }) => {
      await registerToken(userId, input.token, input.platform, prisma);
      return true;
    },
  },
};

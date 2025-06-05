import { registerToken, sendPushNotification } from "../service";

export const notificationResolvers = {
  Mutation: {
    registerPushToken: async (_, { input }, { prisma, userId }) => {
      await registerToken(userId, input.token, input.platform, prisma);
      return true;
    },
    sendTestNotification: async (_, { input }, { prisma }) => {
      const { userId } = input;
      const tokens = await prisma.notificationToken.findMany({
        where: { userId },
      });

      if (!tokens.length) {
        throw new Error("No notification tokens found for this user");
      }

      await Promise.all(
        tokens.map((token) =>
          sendPushNotification(token.token, "This is a test notification 🚀")
        )
      );

      return true;
    },
  },
};

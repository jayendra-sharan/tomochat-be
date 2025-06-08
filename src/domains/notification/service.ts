import { prisma, PrismaClient } from "@/lib/prisma";
import { Expo } from "expo-server-sdk";
import { logger } from "@/lib/logger";

const expo = new Expo();

export async function registerToken(
  userId: string,
  token: string,
  platform: string,
  prisma: PrismaClient
) {
  try {
    return prisma.notificationToken.upsert({
      where: {
        token_platform: { token, platform },
      },
      update: { userId },
      create: {
        token,
        platform,
        userId,
      },
    });
  } catch (error) {
    logger.error(error, { method: "registerToken", userId });
  }
}

export const sendNewMessagePushNotification = async ({
  userId,
  title,
  body,
  data,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}) => {
  try {
    const tokens = await prisma.notificationToken.findMany({
      where: { userId, platform: "expo" },
      select: { token: true },
    });

    const validTokens = tokens.filter(({ token }) =>
      Expo.isExpoPushToken(token)
    );
    const messages = validTokens.map(({ token }) => ({
      to: token,
      title: title?.trim() || "New message",
      body,
      sound: "default",
      data: {
        ...data,
        type: "chat",
      },
    }));

    if (messages.length === 0) return;

    const tickets = await expo.sendPushNotificationsAsync(messages);

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = messages[i].to;

      if (ticket.status === "error") {
        console.error(`[push] Error for ${token}:`, ticket.message);

        const isStale =
          ticket.details?.error === "DeviceNotRegistered" ||
          ticket.message?.includes("DeviceNotRegistered");

        if (isStale) {
          await prisma.notificationToken.deleteMany({
            where: { token },
          });
          console.log(`[push] Removed stale token: ${token}`);
        }
      }
    }
  } catch (err) {
    console.error(`[push] Failed for user ${userId}:`, err);
  }
};
// @todo TEST
export async function sendPushNotification(token: string, message: string) {
  console.log(`[📡] Attempting to send push to token: ${token}`);
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    return;
  }

  const messages = [
    {
      to: token,
      sound: "default",
      body: message,
      data: { withSome: "data" },
    },
  ];

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log("[✅] Push sent. Ticket:", ticketChunk);
  } catch (error) {
    console.error("[❌] Error sending push:", error);
  }
}

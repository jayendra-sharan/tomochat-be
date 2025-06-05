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

    const messages = tokens
      .filter(({ token }) => Expo.isExpoPushToken(token))
      .map(({ token }) => ({
        to: token,
        title,
        body,
        sound: "default",
        data,
      }));

    if (messages.length > 0) {
      await expo.sendPushNotificationsAsync(messages);
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

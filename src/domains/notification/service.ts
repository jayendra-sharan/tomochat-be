import { PrismaClient } from "@/lib/prisma";
import { sendExpoPush } from "./utils";
import { Expo } from "expo-server-sdk";
import { logger } from "@/lib/logger";

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

export async function sendUserNotification(
  userId: string,
  title: string,
  body: string,
  prisma: PrismaClient
) {
  const tokens = await prisma.notificationToken.findMany({ where: { userId } });
  if (!tokens.length) return;

  return sendExpoPush(
    tokens.map((t) => t.token),
    title,
    body
  );
}

// @todo TEST

const expo = new Expo();
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

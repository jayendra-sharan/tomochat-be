import { logger } from "@/lib/logger";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export async function sendExpoPush(
  tokens: string[],
  title: string,
  body: string
) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      logger.debug("Push ticket", ticketChunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error("Expo push error", err);
    }
  }

  return tickets;
}

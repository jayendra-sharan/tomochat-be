import { PrismaClient } from '@/lib/prisma';
import { sendExpoPush } from './utils';

export async function registerToken(
  userId: string,
  token: string,
  platform: string,
  prisma: PrismaClient
) {
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
}

export async function sendUserNotification(
  userId: string,
  title: string,
  body: string,
  prisma: PrismaClient
) {
  const tokens = await prisma.notificationToken.findMany({ where: { userId } });
  if (!tokens.length) return;

  return sendExpoPush(tokens.map(t => t.token), title, body);
}
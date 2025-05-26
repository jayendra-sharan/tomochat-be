import { PrismaClient } from "@/lib/prisma";

type GetUserConnections = {
  userId: string;
  prisma: PrismaClient
}

export const getUserConnections = async ({ userId, prisma }: GetUserConnections) => {
  const connections = await prisma.userConnection.findMany({
    where: {
      userAId: userId,
    },
    include: {
      userB: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  return connections.map((c) => c.userB);
};

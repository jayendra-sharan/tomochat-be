import { DbTx } from "@/lib/prisma";

// @todo drop Type from types
type CreateUserConnectionServiceType = {
  prisma: DbTx;
  userAId: string;
  userBId: string;
}

export const createUserConnectionService = async ({
  prisma,
  userAId,
  userBId,
}: CreateUserConnectionServiceType) => {

    const exists = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId }
        ],
      },
    });

    if (exists) return exists;

    await prisma.userConnection.createMany({
      data: [
        { userAId, userBId },
        { userAId: userBId, userBId: userAId }
      ],
      skipDuplicates: true,
    });

    return prisma.userConnection.findFirst({
      where: { userAId, userBId }
    });
}

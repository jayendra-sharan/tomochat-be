import { PrismaClient } from "@prisma/client";

type AddMemberToRoomInput = {
  roomId: string;
  memberIds: string[];
  prisma: PrismaClient;
};

export async function addMembersToRoom({ roomId, memberIds, prisma }) {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      members: {
        create: memberIds.map((id) => ({
          userId: id,
          role: "member", // @todos add to enum
        })),
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

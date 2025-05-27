import { PrismaClient } from "@/lib/prisma"

type GetRoomDetailsService = {
  prisma: PrismaClient;
  roomId: string;
  userId: string;
}

export const getRoomDetailsService = async ({ prisma, roomId, userId }: GetRoomDetailsService) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      messages: true,
    }
  });

  if (!room) {
    throw new Error("Room not found");
  }
  return room;
}

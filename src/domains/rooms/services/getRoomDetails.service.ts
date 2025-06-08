import { ChatErrors } from "@/domains/shared/errors";
import { PrismaClient } from "@/lib/prisma";

type GetRoomDetailsService = {
  prisma: PrismaClient;
  roomId: string;
};

export const getRoomDetailsService = async ({
  prisma,
  roomId,
}: GetRoomDetailsService) => {
  // const room = fetchRoomDetails({ id: roomId, prisma, info });
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      messages: true,
    },
  });

  if (!room) {
    throw ChatErrors.ROOM_NOT_FOUND;
  }
  return room;
};

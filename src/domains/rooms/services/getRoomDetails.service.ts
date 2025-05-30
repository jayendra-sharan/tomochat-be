import { PrismaClient } from "@/lib/prisma";
import { GraphQLResolveInfo } from "graphql";
import { fetchRoomDetails } from "../db/fetchRoom.db";

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
    throw new Error("Room not found");
  }
  return room;
};

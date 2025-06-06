import { SocketEvents } from "@/constants/socketEvents";
import { ReadMessagePayload } from "@/domains/socket/types";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { Server, Socket } from "socket.io";

export const handleReadMessage = async (io: Server, socket: Socket, payload: ReadMessagePayload) => {
  const { roomId, userId } = payload;
  
  await prisma.messageStatus.updateMany({
    where: {
      userId,
      message: {
        roomId: roomId,
      },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
  io.to(roomId).emit(SocketEvents.READ_MESSAGE_ACK, { roomId, userId })
}

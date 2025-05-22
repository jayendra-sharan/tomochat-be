import { isRoomMember } from "@/domains/rooms/db/isRoomMember.db";
import { logger } from "@/lib/logger";
import type { Socket } from "socket.io";

export const handleJoinRoom = async (socket: Socket, payload: any) => {
  const { userId } = socket.data;
  const { roomId } = payload
  const isMember = await isRoomMember({ userId, roomId });
  if (!isMember) {
    logger.warn(`Unauthorised room join attempt by ${userId} to room ${roomId}`);
    return socket.disconnect();
  }
  if (isMember) {
    socket.join(roomId);
    logger.info(`${userId} has joined the room ${roomId}`);
  }
}

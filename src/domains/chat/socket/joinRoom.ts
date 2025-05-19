import { logger } from "@/lib/logger";
import type { Socket } from "socket.io";

export const handleJoinRoom = (socket: Socket, payload: any) => {
  const { roomId } = payload
  logger.info("User joining room", payload);
  socket.join(roomId);
}

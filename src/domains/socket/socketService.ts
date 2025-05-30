import { SocketEvents } from "@/constants/socketEvents";
import { Server } from "socket.io";
import { getUserSockets } from "./socketRegistry";
import { logger } from "@/lib/logger";

type InAppNotificationMessageData = {
  roomId: string;
  roomName: string;
  displayName: string;
  message: string;
};

type EmitToUserInput = {
  io: Server;
  userId: string;
  data: InAppNotificationMessageData;
};
export const emitInAppNotification = ({
  io,
  userId,
  data,
}: EmitToUserInput) => {
  const sockets = getUserSockets(userId);
  logger.info("Sending update", sockets);
  for (const socketId of sockets) {
    io.to(socketId).emit(SocketEvents.IN_APP_NOTIFICATION, data);
  }
};

export const emitNewUserAddedMessage = () => {};

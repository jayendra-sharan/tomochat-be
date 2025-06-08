import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { handleJoinRoom } from "@/domains/chat/socket/joinRoom";
// import { handleSendMessage } from '@/domains/chat/socket/sendMessage';
import { SocketEvents } from "@/constants/socketEvents";
import { logger } from "./logger";
import { handleUserTyping } from "@/domains/chat/socket/userTyping";
import {
  addUserSocket,
  removeUserSocket,
} from "@/domains/socket/socketRegistry";
import { handleReadMessage } from "@/domains/chat/socket/readMessage";

// @todo move it to new file
interface AuthTokenPayload {
  userId: string;
}
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function verifyJwtAndGetUserId(token: string): string {
  const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  return decoded.userId;
}

export function initSocket(io: Server) {
  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    logger.info("Token", { token: !!token });
    try {
      const userId = verifyJwtAndGetUserId(token);
      socket.data.userId = userId;
      logger.info(`User connected | ${userId} (${socket.id})`);

      addUserSocket(userId, socket.id);

      socket.on(SocketEvents.JOIN_ROOM, (payload) =>
        handleJoinRoom(socket, payload)
      );
      // @todo possibly remove, message is reached to BE via graphql mutation.
      // socket.on(SocketEvents.SEND_MESSAGE, (payload) => handleSendMessage(io, socket, payload));
      socket.on(SocketEvents.START_TYPING, (payload) =>
        handleUserTyping(io, socket, payload, SocketEvents.START_TYPING)
      );
      socket.on(SocketEvents.STOP_TYPING, (payload) =>
        handleUserTyping(io, socket, payload, SocketEvents.STOP_TYPING)
      );
      socket.on(SocketEvents.READ_MESSAGE, (payload) =>
        handleReadMessage(io, socket, payload)
      );
    } catch (error) {
      logger.warn("Socket auth failed", error);
      socket.disconnect();
    }
  });

  io.on("disconnect", (socket) => {
    const userId = socket.data.userId;
    if (userId) {
      removeUserSocket(userId, socket.id);
      logger.info(`User disconnected | ${userId} (${socket.id})`);
    }
  });
}

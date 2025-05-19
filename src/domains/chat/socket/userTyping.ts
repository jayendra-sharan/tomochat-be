import { Server, Socket } from "socket.io";
import { SocketEvents } from "@/constants/socketEvents";

export const handleUserTyping = (io: Server, socket: Socket, payload: any, eventName: SocketEvents) => {
  const { roomId, userId, displayName } = payload;
  if (eventName === SocketEvents.START_TYPING) {
    io.to(roomId).emit(SocketEvents.TYPING_STARTED, { userId, displayName, roomId});
  }
  if (eventName === SocketEvents.STOP_TYPING) {
    io.to(roomId).emit(SocketEvents.TYPING_STOPPED, { userId, displayName, roomId })
  }
}

import { Server } from 'socket.io';
import { handleJoinRoom } from '@/domains/chat/socket/joinRoom';
import { handleSendMessage } from '@/domains/chat/socket/sendMessage';
import { SocketEvents } from '@/constants/socketEvents';
import { logger } from './logger';
import { handleUserTyping } from '@/domains/chat/socket/userTyping';

export function initSocket(io: Server) {
  io.on('connection', (socket) => {
    logger.info('User connected', socket.id);

    socket.on(SocketEvents.JOIN_ROOM, (payload) => handleJoinRoom(socket, payload));
    socket.on(SocketEvents.SEND_MESSAGE, (payload) => handleSendMessage(io, socket, payload));
    socket.on(SocketEvents.START_TYPING, (payload) =>  handleUserTyping(io, socket, payload, SocketEvents.START_TYPING));
    socket.on(SocketEvents.STOP_TYPING, (payload) => handleUserTyping(io, socket, payload, SocketEvents.STOP_TYPING));
  });

  io.on('disconnect', (socket) => {
    logger.info('User disconnected', socket.id);
  });
}

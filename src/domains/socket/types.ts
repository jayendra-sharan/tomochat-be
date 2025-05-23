import { Message } from "../shared/types";

export type JoinRoomPayload = {
  roomId: string;
  userId: string;
}

export type TypingUserPayload = {
  userId: string;
  roomId: string;
  displayName: string;
}

export type ReadMessagePayload = {
  roomId: string;
  userId: string;
}

export type ReadMessageAckPayload = {
  roomId: string;
  userId: string;
}

export interface ClientToServerEvents {
  start_typing: (payload: TypingUserPayload) => void;
  stop_typing: (payload: TypingUserPayload) => void;
  join_room: (payload: JoinRoomPayload) => void;
  leave_room: (payload: JoinRoomPayload) => void;
  "message:read": (payload: ReadMessagePayload) => void;
}

export interface ServerToClientEvents {
  typing_started: (payload: TypingUserPayload) => void;
  typing_stopped: (payload: TypingUserPayload) => void;
  new_message: (payload: Message) => void;
  "message:read:ack": (payload: ReadMessageAckPayload) => void; 
}

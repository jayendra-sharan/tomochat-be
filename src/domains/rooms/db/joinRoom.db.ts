import { sendMessageService, sendMessageTx } from "@/domains/chat/services/message.service";
import { createUserConnectionService } from "@/domains/user/services/createUserConnection.service";
import { logger } from "@/lib/logger";
import { DbTx } from "@/lib/prisma";
import { Server } from "socket.io";

type JoinRoomDbType = {
  roomId: string;
  userId: string;
  prisma: DbTx;
  io: Server
}

export function joinRoomDb({
  roomId,
  userId,
  prisma,
  io
}: JoinRoomDbType) {
  return {
    createRoomMember: async () => {
      try {
        const existing = await prisma.roomMember.findFirst({
          where: {
            roomId,
            userId,
          }
        });
        if (existing) {
          throw new Error("User is already a member of this chat");
        }
        
        await prisma.roomMember.create({
          data: {
            roomId,
            userId,
            role: "member"
          }
        });
      } catch (error) {
        throw new Error(`Error in createRoomMember: ${error?.message}`);
      }
    },
    sendJoinMessage: async (displayName: string) => {
      try {
        await sendMessageTx({
          input: {
            roomId,
            content: `${displayName} joined the chat.`
          },
          user: {
            id: 'SYSTEM',
            displayName: '',
          },
          prisma,
          io,
          isSystemMessage: true
        })
      } catch (error) {
        throw new Error(`Error in sendJoinMessage: ${error?.message}`);
      }
    },
    addUserConnection: async () => {
      try {

        const room = await prisma.room.findUnique({
          where: {
            id: roomId
          },
          include: {
            members: {
              include: {
                user: true,
              }
            }
          }
        });
  
        await Promise.all(
          room.members
            .filter(member => member.userId !== userId)
            .map(member =>
              createUserConnectionService({
                prisma,
                userAId: userId,
                userBId: member.userId
              })
            )
        )
      } catch (error) {
        throw new Error(`Error in addUserConnection: ${error?.message}`);
      }
    }
  }
}

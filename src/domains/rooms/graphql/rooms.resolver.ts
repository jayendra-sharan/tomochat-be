import { sendMessageService } from "@/domains/chat/services/message.service";
import crypto from "crypto";
import { joinRoomService } from "../services/joinRoom.service";
import { getRoomDetailsService } from "../services/getRoomDetails.service";

export const roomsResolvers = {
  Query: {
    rooms: async (_, __, { userId, prisma }) => {
      if (!userId) return "User not authenticated!"      

      const memberships = await prisma.roomMember.findMany({
        where: {
          userId
        },
        include: {
          room: { 
            include: {
              members: {
                include: {
                  user: true,
                }
              },
              messages: {
                take: 1,
                orderBy: { createdAt: "desc" },
                include: {
                  sender: true,
                  perUserStatus: {
                    where: { userId },
                    select: {
                      isRead: true,
                    }
                  }
                }

              }
            }
          }
        },
        orderBy: {
          room: {
            updatedAt: "desc"
          }
        }
      });

      const rooms = memberships.map(m => {
        // @todo refactor
        const room = m.room;
        const lastMessage = room.messages?.[0];
        const isUnread = !lastMessage?.perUserStatus?.[0].isRead;
        const lastMessageSender = lastMessage?.sender;
        let displayName = lastMessageSender?.id === userId ? "You" : (
          lastMessageSender?.id === "SYSTEM" ? "" : lastMessageSender?.displayName
        );

        displayName = displayName ? `${displayName}: ` : '';
        return {
          ...room,
          lastMessage: `${displayName}${lastMessage?.content}` ?? null,
          isUnread,
        }
      });
      return rooms;
    },
    getRoomDetails: async(_: any, { input }, { userId, prisma }) => {
      const { roomId } = input;
      return getRoomDetailsService({ roomId, userId, prisma});
    }
  },
  Mutation: {
    createRoom: async (_, { input }, { userId, prisma, io }) => {
      if (!userId ) {
        return "user not authenticated";
      }

      const inviteLink = crypto.randomBytes(4).toString("hex");
      const { name, language, userDisplayName } = input;

      // @todo update mapping of fields in rooms schemam
      const fields = {
        name,
        roomType: "private",
        topic: language,
      }

      const room = await prisma.room.create({
        data: {
          ...fields,
          inviteLink,
          members: { create: [{ userId, role: "admin" }] },
        },
        include: { members: true },
      });

      // no need to broadcast this message - @todo extract to function
      await sendMessageService({
        input: {
          roomId: room.id,
          content: `${userDisplayName} created ${room.name}.`,
        },
        user: {
          id: 'SYSTEM',
          displayName: '',
        },
        prisma,
        io,
        isSystemMessage: true,
      })

      return {
        ...room,
        inviteLink:  `${room.id}--${inviteLink}`,
      }
    },
    joinRoom: async (_, { input }, { user, prisma, io }) => {
      console.log("join room", input)
      return joinRoomService({ input, user, prisma, io})
    },
    deleteGroup: async (_: any, { input }, { prisma }) => {
      const { roomId } = input;

      await prisma.room.delete({
        where: { id: roomId },
      });

      return true;
    },
    clearGroupMessages: async (_: any, { input }, { prisma }) => {
      const { roomId } = input;
      await prisma.messageStatus.deleteMany({
        where: {
          message: {
            roomId,
          },
        },
      });

      await prisma.message.deleteMany({
        where: {
          roomId,
        },
      });

      return true;
    },
  }
};

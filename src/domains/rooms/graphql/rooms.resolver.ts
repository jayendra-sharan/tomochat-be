import { SocketEvents } from "@/constants/socketEvents";
import { logger } from "@/lib/logger";
import crypto from "crypto";

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
        const room = m.room;
        const lastMessage = room.messages?.[0];
        const isUnread = lastMessage?.perUserStatus?.[0].isRead === false;
        return {
          ...room,
          lastMessage: lastMessage.content,
          isUnread,
        }
      });
      return rooms;
    }
  },
  Mutation: {
    createRoom: async (_, { input }, { userId, prisma }) => {
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

      logger.info("Room", JSON.stringify(room));
      // no need to broadcast this message - @todo extract to function
      await prisma.message.create({
        data: {
          content: `${userDisplayName} created ${room.name}.`,
          senderId: userId,
          roomId: room.id,
        }
      });

      return {
        ...room,
        inviteLink:  `${room.id}--${inviteLink}`,
      }
    },
    joinRoom: async (_, { input }, { userId, prisma, io }) => {
      if (!userId) {
        return "User not authenticated";
      }

      // @todo purpose of inviteId - maybe check expiry
      const [roomId] = input.inviteLink.split("--");
      logger.debug("Input", input);
      const existing = await prisma.roomMember.findFirst({
        where: {
          roomId,
          userId,
        }
      });

      logger.debug("Exisiting", {existing, roomId, userId});

      if (existing) {
        const room = prisma.room.findUnique({
          where: {
            roomId
          }
        });
        // @todos fix return type
        return room;
      }
      
      const gm = await prisma.roomMember.create({
        data: {
          roomId,
          userId,
          role: "member"
        }
      });

      const user = await prisma.user.findUnique({ where: { id: userId }});

      const joinRoomMessage = await prisma.message.create({
        data: {
          content: `${user.displayName} joined the room.`,
          senderId: userId,
          roomId
        },
        include: {
          sender: true, room: true,
        }
      });

      // @toodo extract to a function or singleton
      // @todo for system message create a user to display in FE without prefix, e.g.
      // jay created room ✅
      // jay: jay created room ❎
      io.to(roomId).emit(SocketEvents.NEW_MESSAGE, {
        ...joinRoomMessage,
        createdAt: joinRoomMessage.createdAt.toISOString(),
      });

      return {
        result: true,
      };
    }
  }
};

import { SocketEvents } from "@/constants/socketEvents";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export const roomsResolvers = {
  Query: {
    rooms: async (_, __, { userId, prisma }) => {
      if (!userId) return "User not authenticated!"      

      const memberships = await prisma.groupMember.findMany({
        where: { userId },
        include: {
          group: { 
            include: {
              members: {
                include: {
                  user: true,
                }
              }
            }
          }
        }
      });

      return memberships.map(m => m.group);
    }
  },
  Mutation: {
    createRoom: async (_, { input }, { userId, prisma }) => {
      if (!userId ) {
        return "user not authenticated";
      }

      const inviteLink = crypto.randomBytes(4).toString("hex");
      const { name, language, userDisplayName } = input;

      // @todo update mapping of fields in groups schemam
      const fields = {
        name,
        groupType: "private",
        topic: language,
      }

      const room = await prisma.group.create({
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
          groupId: room.id,
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
      const [groupId] = input.inviteLink.split("--");
      logger.debug("Input", input);
      const existing = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId,
        }
      });

      logger.debug("Exisiting", {existing, groupId, userId});

      if (existing) {
        const group = prisma.group.findUnique({
          where: {
            groupId
          }
        });
        // @todos fix return type
        return group;
      }
      
      const gm = await prisma.groupMember.create({
        data: {
          groupId,
          userId,
          role: "member"
        }
      });

      const user = await prisma.user.findUnique({ where: { id: userId }});

      const joinRoomMessage = await prisma.message.create({
        data: {
          content: `${user.displayName} joined the group.`,
          senderId: userId,
          groupId
        },
        include: {
          sender: true, group: true,
        }
      });

      // @toodo extract to a function or singleton
      // @todo for system message create a user to display in FE without prefix, e.g.
      // jay created group ✅
      // jay: jay created group ❎
      io.to(groupId).emit(SocketEvents.NEW_MESSAGE, {
        ...joinRoomMessage,
        createdAt: joinRoomMessage.createdAt.toISOString(),
      });

      return {
        result: true,
      };
    }
  }
};

import { sendMessageService } from "@/domains/chat/services/message.service";
import crypto from "crypto";
import { joinRoomService } from "../services/joinRoom.service";
import { getRoomDetailsService } from "../services/getRoomDetails.service";
import { logger } from "@/lib/logger";
import { createRoomService } from "../services/createRoom.service";
import { formatLastMessage } from "../utils/formatLastMessage";

export const roomsResolvers = {
  Query: {
    rooms: async (_, __, { userId, prisma }) => {
      try {
        if (!userId) throw new Error("User not authenticated");
        const memberships = await prisma.roomMember.findMany({
          where: {
            userId,
          },
          include: {
            room: {
              include: {
                members: {
                  include: {
                    user: true,
                  },
                },
                messages: {
                  take: 1,
                  orderBy: { createdAt: "desc" },
                  where: {
                    perUserStatus: {
                      none: {
                        userId,
                        isDeleted: true,
                      },
                    },
                  },
                  include: {
                    sender: true,
                    perUserStatus: {
                      where: { userId },
                      select: {
                        isRead: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            room: {
              updatedAt: "desc",
            },
          },
        });

        const rooms = memberships.map((m) => {
          // @todo refactor
          const room = m.room;
          const lastMessage = room.messages?.[0];
          const isUnread = !lastMessage?.perUserStatus?.[0].isRead;
          const lastMessageSender = lastMessage?.sender;
          const lastMessageAt = lastMessage?.createdAt;
          return {
            ...room,
            lastMessage: formatLastMessage(
              lastMessageSender,
              lastMessage?.content,
              userId
            ),
            lastMessageAt,
            isUnread,
          };
        });
        return rooms;
      } catch (error) {
        logger.error("Error in fetching rooms", error);
        throw new Error(error);
      }
    },
    getRoomDetails: async (_: any, { input }, { userId, prisma }) => {
      if (!userId) {
        throw new Error("User not authorised");
      }
      const { roomId } = input;
      return getRoomDetailsService({ roomId, prisma });
    },
  },
  Mutation: {
    createRoom: async (_, { input }, { userId, user, prisma, io }) => {
      try {
        if (!userId) {
          return "user not authenticated";
        }

        const inviteLink = crypto.randomBytes(4).toString("hex");
        const { name, language, userDisplayName, ...rest } = input;

        // @todo update mapping of fields in rooms schemam
        const fields = {
          name,
          roomType: "private",
          topic: language,
        };

        const room = await prisma.room.create({
          data: {
            ...fields,
            ...rest,
            inviteLink,
            members: { create: [{ userId, role: "admin" }] },
          },
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        });

        // no need to broadcast this message - @todo extract to function
        await sendMessageService({
          input: {
            roomId: room.id,
            content: `${userDisplayName} created the group.`,
          },
          user: {
            id: "SYSTEM",
            displayName: "",
          },
          prisma,
          io,
          isSystemMessage: true,
        });

        return {
          ...room,
          lastMessage: `${userDisplayName} created the group.`,
          isUnread: true,
          inviteLink: `${room.id}--${inviteLink}`,
        };
      } catch (error) {
        logger.error(`Error in createRoom: - ${error.message}`);
        throw new Error(`Error in createRoom: - ${error.message}`);
      }
    },
    joinRoom: async (_, { input }, { user, prisma, io }) => {
      return joinRoomService({ input, user, prisma, io });
    },
    deleteRoom: async (_: any, { input }, { prisma, userId }) => {
      const { roomId } = input;
      try {
        const admin = await prisma.roomMember.findUnique({
          where: {
            userId_roomId: { userId, roomId },
          },
        });

        if (!admin || admin.role !== "admin") {
          throw new Error("You are not authorised to perform this action.");
        }

        await prisma.room.delete({
          where: { id: roomId },
        });

        return true;
      } catch (error) {
        logger.error(error, { method: "deleteRoom", userId, roomId });
        throw new Error(error);
      }
    },
    leaveRoom: async (_: any, { input }, { prisma, userId }) => {
      const { roomId } = input;

      const leavingMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: { userId, roomId },
        },
      });

      if (!leavingMember) {
        throw new Error("User is not a member of the room");
      }

      const isLeavingMemberAnAdmin = leavingMember.role === "admin";

      let isLastAdmin = false;
      if (isLeavingMemberAnAdmin) {
        const adminCount = await prisma.roomMember.count({
          where: {
            roomId,
            role: "admin",
          },
        });

        isLastAdmin = adminCount === 1;
      }

      await prisma.roomMember.delete({
        where: {
          userId_roomId: {
            userId,
            roomId,
          },
        },
      });

      if (isLastAdmin) {
        await prisma.roomMember.updateMany({
          where: { roomId },
          data: { role: "admin" },
        });
      }

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
    addMembersToRoom: async (_: any, { input }, ctx) => {
      // @todo follow this pattern for all resolvers - latest v1
      const roomService = await createRoomService(ctx);
      const room = await roomService.addMembersToRoom(input);
      roomService.notifyOnAddMembers(input);
      return room;
    },
    makeUserAdmin: async (_: any, { input }, ctx) => {
      const { memberId, roomId } = input;
      const { prisma, userId } = ctx;

      const admin = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: { userId, roomId },
        },
      });

      if (!admin || admin.role !== "admin") {
        throw new Error("You do not have permission to perform this action.");
      }

      await prisma.roomMember.update({
        where: {
          userId_roomId: { userId: memberId, roomId },
        },
        data: {
          role: "admin",
        },
      });

      return true;
    },
  },
};

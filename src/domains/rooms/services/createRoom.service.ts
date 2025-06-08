import { addMembersToRoom } from "../db/addMembersToRoom.db";
import { sendMessageService } from "@/domains/chat/services/message.service";
import { ChatErrors } from "@/domains/shared/errors";
import { GraphQLContext } from "@/types/graphql-context";

type AddMemberToRoom = {
  roomId: string;
  memberIds: string[];
};

export const createRoomService = async (ctx: GraphQLContext) => {
  return {
    addMembersToRoom: async (input: AddMemberToRoom) => {
      const { roomId, memberIds } = input;
      const { prisma, userId } = ctx;
      if (!userId) {
        throw ChatErrors.USER_NOT_LOGGED_IN;
      }

      return addMembersToRoom({ roomId, memberIds, prisma });
    },
    notifyOnAddMembers: async (input) => {
      const { memberIds, roomId } = input;
      const { userId, prisma, io } = ctx;
      const [addedBy, users] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { displayName: true },
        }),
        prisma.user.findMany({
          where: { id: { in: memberIds } },
          select: { displayName: true },
        }),
      ]);

      const names = users.slice(0, 2).map((u) => u.displayName);

      const messageText =
        names.length === 1
          ? `${addedBy?.displayName} added ${names[0]}.`
          : `${addedBy?.displayName} added ${names.join(", ")}${users.length > 2 ? " and others" : ""}.`;

      sendMessageService({
        input: {
          roomId,
          content: messageText,
        },
        user: {
          id: "SYSTEM",
          displayName: "",
        },
        prisma,
        io,
        isSystemMessage: true,
      });
      return messageText;
    },
  };
};

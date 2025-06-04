import { prisma } from "@/lib/prisma";
export const sharedResolvers = {
  RoomMember: {
    user: (parent) => parent.user,
    room: (parent) => parent.room,
    // joinedAt: (parent) => parent.joinedAt.toISOString(),
  },
  Room: {
    members: (parent) => parent.members,
    messageCount: (parent) =>
      prisma.message.count({ where: { roomId: parent.id } }),
  },
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  UserConnection: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
};

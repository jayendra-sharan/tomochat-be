import { logger } from "@/lib/logger";
import crypto from "crypto";

export const groupResolvers = {
  Query: {
    groups: async (_, __, { userId, prisma }) => {
      if (!userId) return "not authenticated";

      const memberships = await prisma.groupMember.findMany({
        where: { userId },
        include: { group: { include: { members: { include: { user: true } } } } },
      });

      return memberships.map((m) => m.group);
    },
  },
  Mutation: {
    createGroup: async (_, { input }, { userId, io, prisma }) => {
      if (!userId) return "User not authenticated";

      const inviteLink = crypto.randomBytes(4).toString("hex");

      const group = await prisma.group.create({
        data: {
          ...input,
          inviteLink,
          members: { create: [{ userId, role: "admin" }] },
        },
        include: { members: true },
      });

      const autoMessage = await prisma.message.create({
        data: {
          content: `${group.name} created successfully.`,
          senderId: userId,
          groupId: group.id,
        },
      });

      io.to(group.id).emit("newMessage", autoMessage);

      return { ...group, inviteLink: `${inviteLink}--${group.id}` };
    },

    joinGroupByInviteLink: async (_, { input }, { userId, prisma, io }) => {
      if (!userId) return "User not authenticated";

      const [inviteId, groupId] = input.inviteLink.split("--");

      const existing = await prisma.groupMember.findFirst({ where: { groupId, userId } });
      if (existing) return prisma.group.findUnique({ where: { id: groupId } });

      await prisma.groupMember.create({ data: { groupId, userId, role: "member" } });

      const user = await prisma.user.findUnique({ where: { id: userId } });

      const message = await prisma.message.create({
        data: {
          content: `${user.displayName || user.email} joined the group`,
          senderId: userId,
          groupId,
        },
        include: { sender: true, group: true },
      });

      io.to(groupId).emit("newMessage", message);
      return prisma.group.findUnique({ where: { id: groupId } });
    },
  }
}
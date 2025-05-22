import { prisma } from "@/lib/prisma";

export type IsRoomMemberPayload = {
  userId: string;
  roomId: string;
}
export async function isRoomMember({
  userId,
  roomId,
}: IsRoomMemberPayload) {
  return await prisma.groupMember.findFirst({
    where: {
      userId,
      groupId: roomId,
    }
  });
}

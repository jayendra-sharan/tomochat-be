import { getRequestFields } from "@/domains/shared/utils/getRequestFields";
import { PrismaClient } from "@/lib/prisma";
import { GraphQLResolveInfo } from "graphql";

export type FetchRoomDetails = {
  id: string;
  info: GraphQLResolveInfo;
  prisma: PrismaClient;
};

const forbiddenPrismaFields = new Set(["messageCount"]);
function filterPrismaSelectable(fields: Record<string, boolean>) {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => !forbiddenPrismaFields.has(key))
  );
}
export async function fetchRoomDetails({ id, info, prisma }: FetchRoomDetails) {
  try {
    const select = filterPrismaSelectable(getRequestFields(info, ""));

    console.log("Fields", id, select);
    return prisma.room.findUnique({
      where: { id },
      select,
    });
  } catch (error) {
    throw new Error(`Error in fetchRoom.db.ts - ${error.message}`);
  }
}

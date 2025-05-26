import { logger } from "@/lib/logger";
import { joinRoomDb } from "../db/joinRoom.db";
import { User } from "@prisma/client";
import { PrismaClient } from "@/lib/prisma";
import { Server } from "socket.io";

type JoinRoomService = {
  input: { inviteLink: string };
  user: User;
  prisma: PrismaClient;
  io: Server
}

export const joinRoomService = async ({ input,  user, prisma, io }: JoinRoomService) => {
  try {
    const { id: userId, displayName } = user;
    const { inviteLink } = input;
    const [roomId] = inviteLink.split("--");
    // @todo later add check for inviteId too.
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await prisma.$transaction(async (tx) => {
      const dbTx = joinRoomDb({ roomId, userId, prisma: tx, io});
      logger.debug("Fetch transaction service");
      await dbTx.createRoomMember();
      logger.info("Member created successfully");

      await dbTx.sendJoinMessage(displayName);
      logger.info("Message sent");
      await dbTx.addUserConnection();
      logger.info("Connection created");
    });


    return {
      result: true,
    };
  } catch (error) {
    throw new Error(`Error in joinRoomService: ${error?.message}`)
  }
  
}

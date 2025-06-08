import type { Server as SocketIOServer } from "socket.io";
import type { YogaInitialContext } from "graphql-yoga";
import type { PrismaClient } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
  userId: string | null;
  io: SocketIOServer;
  user: User | null;
}

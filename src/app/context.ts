import jwt from "jsonwebtoken";
import { io } from "./server";
import { YogaInitialContext } from "graphql-yoga";
import { PrismaClient } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { Server as SocketIOServer } from "socket.io";
import { logger } from "@/lib/logger";
import { User } from "@/generated/prisma/client";
import { verifyIdToken } from "@/domains/auth/service/firebase/firebaseTokenService";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface AuthTokenPayload {
  userId: string;
}

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
  userId: string | null;
  io: SocketIOServer;
  user: User | null;
}

export async function createContext({ request }: { request: Request }) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let userId: string | null = null;
  let user: User | null = null;

  if (token) {
    try {
      const decoded = await verifyIdToken(token);
      userId = decoded.uid;
      if (!decoded.email_verified) {
        throw new Error("Please verify your email before continuing");
      }
      user = await prisma.user.findUnique({
        where: { firebaseUid: userId },
      });
    } catch (error) {
      logger.error("Error in decoding token", error.message);
      userId = null;
    }
  }

  return {
    prisma,
    userId,
    io,
    user,
  };
}

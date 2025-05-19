import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { io } from './server';
import { YogaInitialContext } from 'graphql-yoga';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface AuthTokenPayload {
  userId: string;
}

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
  userId: string | null;
  io: SocketIOServer
}

export async function createContext({ request }: { request: Request}) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let userId: string | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      userId = decoded.userId;
    } catch (error) {
      logger.error("Error in decoding token", error.message);
      userId = null;
    }
  }

  return {
    prisma,
    userId,
    io,
  }
}

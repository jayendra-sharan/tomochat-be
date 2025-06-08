import jwt from "jsonwebtoken";
import { io } from "./server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { User } from "@/generated/prisma/client";
import type { GraphQLContext } from "@/types/graphql-context";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface AuthTokenPayload {
  userId: string;
}

export async function createContext({
  request,
}: {
  request: Request;
}): Promise<GraphQLContext> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let userId: string | null = null;
  let user: User | null = null;

  if (token) {
    try {
      const decoded = (await jwt.verify(token, JWT_SECRET)) as AuthTokenPayload;
      userId = decoded.userId;
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      logger.error("Error in decoding token", error.message);
      userId = null;
    }
  }

  return {
    request,
    prisma,
    userId,
    io,
    user,
    params: {},
    waitUntil: () => {},
  };
}

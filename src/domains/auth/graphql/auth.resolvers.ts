import { GraphQLContext } from "@/app/context";
import { logger } from "@/lib/logger";
import { requestEmailVerification } from "@/services/emailVerification";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmailCode } from "../service/emailVerification";
import { createJwt } from "@/lib/jwt";


export const authResolvers = {
  Query: {
    me: async (_: any, _args: any, { userId, prisma}: GraphQLContext) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          rooms: {
            include: {
              room: {
                include: {
                  members: {
                    include: {
                      user: true,
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (!user) {
        throw new Error("User not found!");
      }

      const rooms = user.rooms.map((gm) => gm.room);

      return {
        ...user,
        rooms,
      };
    },
    login: async (_, { input }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !bcryptjs.compare(input.password, user.password)) {
        throw new Error("Invalid email address or password");
      }
      
      const token = createJwt(user.id);
      return { token, user };
    },
  },
  Mutation: {
    createUser: async (_, { input }, { prisma }) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new Error("User already exist");

      const hashedPassword = await bcryptjs.hash(input.password, 10);
      return prisma.user.create({
        data: {
          ...input,
          userType: input.userType || "human",
          password: hashedPassword
        }
      });
    },
    requestEmailVerification: async(_, { input }) => {
      return requestEmailVerification(input.email)
    },
    verifyEmailCode: async (_, { input }, { prisma}) => {
      return verifyEmailCode({
        prisma,
        code: input.code,
        email: input.email,
      });
    }
  }
}

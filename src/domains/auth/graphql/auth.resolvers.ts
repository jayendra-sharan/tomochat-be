import { requestEmailVerification } from "@/services/emailVerification";
import bcryptjs from "bcryptjs";
import { verifyEmailCode } from "../service/emailVerification";
import { createJwt } from "@/lib/jwt";
import { getAuthService } from "../service/auth.service";
import { logger } from "@/lib/logger";
import { joinRoomService } from "@/domains/rooms/services/joinRoom.service";
import { ChatErrors } from "@/domains/shared/errors";
import { GraphQLContext } from "@/types/graphql-context";

const isDev = process.env.NODE_ENV === "development";

export const authResolvers = {
  Query: {
    me: async (_: any, _args: any, { userId, prisma }: GraphQLContext) => {
      if (!userId) {
        throw ChatErrors.USER_NOT_LOGGED_IN;
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
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!user) {
        throw ChatErrors.USER_NOT_FOUND;
      }

      const rooms = user.rooms.map((gm) => gm.room);

      return {
        ...user,
        rooms,
      };
    },
    login: async (_, { input }, { prisma }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !(await bcryptjs.compare(input.password, user.password))) {
        throw ChatErrors.INVALID_EMAIL_PASSWORD;
      }

      const token = createJwt(user.id);
      return { token, user };
    },
  },
  Mutation: {
    createUser: async (_, { input }, { prisma, io }) => {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) throw ChatErrors.EXISTING_USER;

      const hashedPassword = await bcryptjs.hash(input.password, 10);
      const user = await prisma.user.create({
        data: {
          email: input.email,
          displayName: input.displayName,
          userType: input.userType || "human",
          password: hashedPassword,
          isEmailVerified: isDev,
        },
      });

      if (input.inviteLink) {
        joinRoomService({ input, user, prisma, io }).then(() => {
          logger.info("User added to room during user create");
        });
      }

      if (!isDev) {
        await requestEmailVerification(user.email);
      }
      return user;
    },
    requestEmailVerification: async (_, { input }) => {
      return requestEmailVerification(input.email);
    },
    verifyEmailCode: async (_, { input }, { prisma }) => {
      return verifyEmailCode({
        prisma,
        code: input.code,
        email: input.email,
      });
    },
    changePassword: async (_, { input }, ctx) => {
      const authService = await getAuthService({ ctx });
      return authService.changePassword(input);
    },
    requestPasswordReset: async (_, { input }, ctx) => {
      const authService = await getAuthService({ ctx });
      return authService.requestPasswordReset({ input });
    },
    recoverPassword: async (_, { input }, ctx) => {
      const authService = await getAuthService({ ctx });
      return authService.recoverPassword({ input });
    },
  },
};

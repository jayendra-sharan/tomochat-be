import { GraphQLContext } from "@/app/context";
import { requestEmailVerification } from "@/services/emailVerification";
import bcryptjs from "bcryptjs";
import { verifyEmailCode } from "../service/emailVerification";
import { createJwt } from "@/lib/jwt";
import { getAuthService } from "../service/auth.service";
import { firebaseAdminAuth } from "../service/firebase/firebaseAdmin";
import { logger } from "@/lib/logger";

export const authResolvers = {
  Query: {
    me: async (_: any, _args: any, { userId, prisma }: GraphQLContext) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await prisma.user.findUnique({
        where: { firebaseUid: userId },
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
        throw new Error("User not found!");
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
        throw new Error("Invalid email address or password");
      }

      const token = createJwt(user.id);
      return { token, user };
    },
  },
  Mutation: {
    createUser: async (_, { input }, { prisma }) => {
      try {
        const { idToken, displayName, userType = "human" } = input;
      const decoded = await firebaseAdminAuth.verifyIdToken(idToken);
      const { uid: firebaseUid, email } = decoded;

      const existing = await prisma.user.findUnique({
        where: { firebaseUid },
      });

      if (existing) throw new Error("User already exist");

      const user = await prisma.user.create({
        data: {
          firebaseUid,
          email: email,
          displayName: displayName,
          userType: userType,
        },
      });

      const firebaseLink = await firebaseAdminAuth.generateEmailVerificationLink(email, {
        url: `${process.env.REGISTER_LINK_DOMAIN}/verify`,
        handleCodeInApp: true
      });

      const url = new URL(firebaseLink);
      const oobCode = url.searchParams.get('oobCode');

      const customLink = `http://localhost:8081/verify?oobCode=${oobCode}`;



      requestEmailVerification({ displayName, email, link: customLink });

      return user;
      } catch (error) {
        logger.error(error, { method: "createUser" })
      }
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

import bcryptjs from "bcryptjs";
import { logger } from "@/lib/logger";
import { addMinutes } from "date-fns";
import { getEmailService } from "@/services/email";
import { generateToken } from "@/services/generateToken";
import {
  AuthenticationError,
  AuthorizationError,
  ChatErrors,
  UserInputError,
} from "@/domains/shared/errors";

export const getAuthService = async ({ ctx }) => {
  return {
    changePassword: async (input) => {
      const { userId, prisma } = ctx;
      const { currentPassword, newPassword } = input;
      if (!userId) {
        throw ChatErrors.USER_NOT_LOGGED_IN;
      }
      // @todo move to changePassword.db.ts
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, displayName: true },
      });

      if (!user) {
        throw ChatErrors.USER_NOT_FOUND;
      }

      const isMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!isMatch) {
        throw ChatErrors.INCORRECT_CURRENT_PASSWORD;
      }

      const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
      return true;
    },
    requestPasswordReset: async ({ input }) => {
      const { prisma } = ctx;
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user) {
        return true;
      }
      const token = await generateToken();
      const expiresAt = addMinutes(new Date(), 30);
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      const emailService = await getEmailService();
      await emailService.passwordRecovery({
        link: resetLink,
        email: user.email,
      });
      return true;
    },
    recoverPassword: async ({ input }) => {
      const { token, password } = input;
      const { prisma } = ctx;

      const resetCode = await prisma.passwordResetToken.findUnique({
        where: { token: token },
        include: { user: true },
      });

      if (!resetCode || resetCode.purpose !== "PASSWORD_RESET") {
        throw ChatErrors.INVALID_RESET_TOKEN;
      }

      const now = new Date();
      if (resetCode.expiresAt && resetCode.expiresAt < now) {
        throw ChatErrors.TOKEN_EXPIRED;
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetCode.userId },
          data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.delete({ where: { token: token } }), // remove token
      ]);

      return true;
    },
  };
};

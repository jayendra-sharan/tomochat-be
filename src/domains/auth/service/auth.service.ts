import bcryptjs from "bcryptjs";
import { logger } from "@/lib/logger";
import { addMinutes } from "date-fns";
import { getEmailService } from "@/services/email";
import { generateToken } from "@/services/generateToken";

export const getAuthService = async ({ ctx }) => {
  return {
    changePassword: async (input) => {
      try {
        const { userId, prisma } = ctx;
        const { currentPassword, newPassword } = input;
        if (!userId) {
          throw new Error("Unauthorized");
        }
        // @todo move to changePassword.db.ts
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { password: true, displayName: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        if (!isMatch) {
          throw new Error("Current password is incorrect");
        }

        const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        return true;
      } catch (error) {
        logger.error(`Error in auth.service->changePassword: ${error.message}`);
        throw new Error(error.message);
      }
    },
    requestPasswordReset: async ({ input }) => {
      try {
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
      } catch (error) {
        logger.error(
          `Error in auth.service->requestPasswordReset ${error.message}`
        );
        throw new Error(error.message);
      }
    },
    recoverPassword: async ({ input }) => {
      try {
        const { token, password } = input;
        const { prisma } = ctx;

        const resetCode = await prisma.passwordResetToken.findUnique({
          where: { token: token },
          include: { user: true },
        });

        logger.debug("Reset", resetCode);
        if (!resetCode || resetCode.purpose !== "PASSWORD_RESET") {
          throw new Error("Invalid or expired token.");
        }

        const now = new Date();
        if (resetCode.expiresAt && resetCode.expiresAt < now) {
          throw new Error("Token has expired.");
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
      } catch (error) {
        logger.error(
          `Error in auth.service->requestPasswordReset ${error.message}`
        );
        throw new Error(error.message);
      }
    },
  };
};

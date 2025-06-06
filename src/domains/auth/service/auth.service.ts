import bcryptjs from "bcryptjs";
import { logger } from "@/lib/logger";
import { addMinutes } from "date-fns";
import { getEmailService } from "@/services/email";
import { generateToken } from "@/services/generateToken";
import { firebaseAdminAuth } from "./firebase/firebaseAdmin";

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
        // @todo maybe use rest for this
        const { email } = input;
        const firebaseLink = await firebaseAdminAuth.generatePasswordResetLink(email, {
          url: `${process.env.REGISTER_LINK_DOMAIN}/reset`,
          handleCodeInApp: true
        })
  
        const url = new URL(firebaseLink);
        const oobCode = url.searchParams.get('oobCode');
  
        const customLink = `${process.env.FRONTEND_URL}/reset?oobCode=${oobCode}`;
        const emailService = await getEmailService();  
        await emailService.passwordRecovery({
          link: customLink,
          email: email,
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

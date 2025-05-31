import { logger } from "@/lib/logger";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL;

export const getEmailService = async () => {
  return {
    passwordRecovery: async ({ link, email }) => {
      const html = `
      <p>Click on the following link to reset your password</p>
      <br />
      <a href="${link}">Reset your password</a>
      <br />
      <p>If it doesn't work, you could also copy and paste this link in the browser</p>

      <pre>${link}</pre>
    `;
      const subject = "Password reset - TomoChat";
      const emailPayload = {
        from: `TomoChat <${fromEmail}>`,
        subject,
        to: email,
        html,
      };
      logger.debug("Sending email", emailPayload);
      await resend.emails.send(emailPayload);
    },
  };
};

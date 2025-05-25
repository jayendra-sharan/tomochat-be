import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { addMinutes } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function requestEmailVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = addMinutes(new Date(), 10);

  await prisma.verificationCode.create({
    data: { userId: user.id, code, expiresAt },
  });

  const html = `
    <p>Hoi ${user.displayName}! 👋</p>
    <p>Welcome to TomoChat 🎉</p>
    <p>To complete your registration, use the verification code below:</p>
    <h2 style="font-size: 24px; letter-spacing: 2px;">${code}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `

  const emailPayload = {
    from: `TomoChat <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to TomoChat",
    html,
  };
  console.log("Sending email", emailPayload)
  await resend.emails.send(emailPayload);

  return true;
}

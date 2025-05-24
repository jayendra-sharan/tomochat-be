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

  await resend.emails.send({
    from: "no-reply@tomochat.xyz",
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is ${code}`,
  });

  return true;
}
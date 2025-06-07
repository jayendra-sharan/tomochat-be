import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { addMinutes } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function requestEmailVerification({
  displayName,
  email,
  link
}: { displayName: string, email: string, link: string}) {
  
  const html = `
    <p>Hoi ${displayName}! 👋</p>
    <p>Welcome to TomoChat 🎉</p>
    <p>To complete your registration, use the verification code below:</p>
    <a href="${link}">Link to verify</a>
  `

  const emailPayload = {
    from: `TomoChat <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to TomoChat",
    html,
  };
  await resend.emails.send(emailPayload);

  return true;
}

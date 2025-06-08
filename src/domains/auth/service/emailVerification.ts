import { ChatErrors } from "@/domains/shared/errors";
import { createJwt } from "@/lib/jwt";
import { PrismaClient } from "@/lib/prisma";

type VerifyEmailCode = {
  email: string;
  code: string;
  prisma: PrismaClient;
};

export async function verifyEmailCode(payload: VerifyEmailCode) {
  const { prisma, email, code } = payload;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ChatErrors.USER_NOT_LOGGED_IN;

  const record = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw ChatErrors.EMAIL_VERIFICATION_TOKEN_EXPIRED;

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  await prisma.verificationCode.deleteMany({
    where: { userId: user.id },
  });

  const token = createJwt(user.id);

  return {
    user,
    token,
  };
}

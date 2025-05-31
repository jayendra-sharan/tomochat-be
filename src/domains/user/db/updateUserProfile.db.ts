export async function updateUserProfile({ userId, input, prisma }) {
  return prisma.userProfile.create({
    where: { userId },
    data: {
      ...input,
    },
  });
}

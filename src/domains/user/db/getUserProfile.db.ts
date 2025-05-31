export async function getUserProfile({ userId, prisma }) {
  return prisma.userProfile.findUnique({
    where: {
      userId,
    },
  });
}

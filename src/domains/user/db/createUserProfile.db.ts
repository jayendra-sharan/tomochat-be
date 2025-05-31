export async function createUserProfile({ userId, input, prisma }) {
  return prisma.userProfile.create({
    data: {
      userId,
      ...input,
    },
  });
}

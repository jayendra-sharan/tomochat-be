import { createUserProfile } from "../db/createUserProfile.db";
import { getUserProfile } from "../db/getUserProfile.db";
import { updateUserProfile } from "../db/updateUserProfile.db";

export const userService = async ({ ctx }) => {
  return {
    getMyprofile: async () => {
      try {
        const { userId, prisma } = ctx;

        if (!userId) {
          throw new Error("Unauthorized");
        }
        return await getUserProfile({ userId, prisma });
      } catch (error) {
        console.error(
          `Error in user.service.ts: getMyprofile - ${error.message}`
        );
        throw new Error(
          `Error in user.service.ts: getMyprofile - ${error.message}`
        );
      }
    },
    createUserProfile: async ({ input, ctx }) => {
      try {
        const { userId, prisma } = ctx;

        if (!userId) {
          throw new Error("Unauthorized");
        }

        return createUserProfile({ userId, input, prisma });
      } catch (error) {
        console.error(
          `Error in user.service.ts: createUserProfile - ${error.message}`
        );
        throw new Error(
          `Error in user.service.ts: createUserProfile - ${error.message}`
        );
      }
    },
    updateUserProfile: async ({ input, ctx }) => {
      try {
        const { userId, prisma } = ctx;

        if (!userId) {
          throw new Error("Unauthorized");
        }

        return updateUserProfile({ userId, input, prisma });
      } catch (error) {
        console.error(
          `Error in user.service.ts: updateUserProfile - ${error.message}`
        );
        throw new Error(
          `Error in user.service.ts: updateUserProfile - ${error.message}`
        );
      }
    },
  };
};

import { createUserConnectionService } from "../services/createUserConnection.service";
import { getUserConnections } from "../services/getUserConnections.service";

export const userResolvers = {
  Query: {
    getUserConnections: async (_: any, __: any, { userId, prisma })  => {
      return getUserConnections({ userId, prisma });
    }
  },
  Mutation: {
    createUserConnection: async (_: any, { input }, { prisma }) => {
      const { userAId, userBId } = input;
      return createUserConnectionService({ prisma, userAId, userBId});
    },
  },
};

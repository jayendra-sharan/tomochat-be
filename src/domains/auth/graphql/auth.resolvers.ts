import { GraphQLContext } from "@/app/context";
import { logger } from "@/lib/logger";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const authResolvers = {
  Query: {
    me: async (_: any, _args: any, { userId, prisma}) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          groups: {
            include: {
              group: {
                include: {
                  members: {
                    include: {
                      user: true,
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (!user) {
        throw new Error("User not found!");
      }

      const groups = user.groups.map((gm) => gm.group);

      return {
        ...user,
        groups,
      };
    },
    login: async (_, { input }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !bcryptjs.compare(input.password, user.password)) {
        throw new Error("Invalid email address or password");
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
      return { token, user };
    },
  },
  Mutation: {
    createUser: async (_, { input }, { prisma }) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new Error("User already exist");

      const hashedPassword = await bcryptjs.hash(input.password, 10);
      return prisma.user.create({
        data: {
          ...input,
          userType: input.userType || "human",
          password: hashedPassword
        }
      });
    },
  }
}

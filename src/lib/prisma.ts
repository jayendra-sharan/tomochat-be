import { PrismaClient as GeneratedPrismaClient, Prisma } from '@/generated/prisma/client';

export const prisma = new GeneratedPrismaClient();

// Export instance type, not constructor type
export type PrismaClient = InstanceType<typeof GeneratedPrismaClient>;
export type DbTx = Prisma.TransactionClient;

import { PrismaClient as GeneratedPrismaClient } from '@/generated/prisma/client';

export const prisma = new GeneratedPrismaClient();

// Export type alias so everyone uses the same source
export type PrismaClient = GeneratedPrismaClient;

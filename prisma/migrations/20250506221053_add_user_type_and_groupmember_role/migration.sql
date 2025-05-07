-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" TEXT NOT NULL DEFAULT 'human';

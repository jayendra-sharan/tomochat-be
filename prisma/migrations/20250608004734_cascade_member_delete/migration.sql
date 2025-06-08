-- DropForeignKey
ALTER TABLE "RoomMember" DROP CONSTRAINT "RoomMember_userId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "lastMessage" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

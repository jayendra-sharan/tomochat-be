-- DropForeignKey
ALTER TABLE "MessageStatus" DROP CONSTRAINT "MessageStatus_messageId_fkey";

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

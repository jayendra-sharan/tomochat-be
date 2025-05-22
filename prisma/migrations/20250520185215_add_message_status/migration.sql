-- CreateTable
CREATE TABLE "MessageStatus" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MessageStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageStatus_messageId_userId_key" ON "MessageStatus"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

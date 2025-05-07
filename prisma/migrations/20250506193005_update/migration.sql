/*
  Warnings:

  - A unique constraint covering the columns `[inviteLink]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Made the column `inviteLink` on table `Group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "inviteLink" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_inviteLink_key" ON "Group"("inviteLink");

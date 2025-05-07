/*
  Warnings:

  - Added the required column `groupType` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "groupType" TEXT NOT NULL,
ADD COLUMN     "inviteLink" TEXT,
ADD COLUMN     "topic" TEXT NOT NULL;

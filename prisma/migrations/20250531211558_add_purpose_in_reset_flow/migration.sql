-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'PASSWORD_RESET';

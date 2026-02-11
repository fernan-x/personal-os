-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "customDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

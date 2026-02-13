-- AlterTable
ALTER TABLE "users" ADD COLUMN     "enabledModules" TEXT[] DEFAULT ARRAY['habits', 'budget', 'pets', 'meals']::TEXT[];

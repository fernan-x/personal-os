-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('lose', 'maintain', 'gain');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activityLevel" "ActivityLevel",
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "fitnessGoal" "FitnessGoal",
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION;

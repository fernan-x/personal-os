import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export {
  PrismaClient,
  HabitFrequency,
  ExpenseScope,
  ExpenseRecurrence,
  ExpenseStatus,
  ActivityType,
  TrainingStatus,
  MedicationFrequency,
} from "@prisma/client";
export type * from "@prisma/client";

-- CreateEnum
CREATE TYPE "ExpenseScope" AS ENUM ('personal', 'common');

-- CreateEnum
CREATE TYPE "ExpenseRecurrence" AS ENUM ('recurring', 'exceptional');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('pending', 'paid');

-- CreateTable
CREATE TABLE "budget_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_plans" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "monthlyPlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planned_expenses" (
    "id" TEXT NOT NULL,
    "monthlyPlanId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "scope" "ExpenseScope" NOT NULL DEFAULT 'personal',
    "recurrence" "ExpenseRecurrence" NOT NULL DEFAULT 'recurring',
    "status" "ExpenseStatus" NOT NULL DEFAULT 'pending',
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planned_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_shares" (
    "id" TEXT NOT NULL,
    "plannedExpenseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,

    CONSTRAINT "expense_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envelopes" (
    "id" TEXT NOT NULL,
    "monthlyPlanId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "allocatedAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envelopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envelope_entries" (
    "id" TEXT NOT NULL,
    "envelopeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "envelope_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_memberships_groupId_idx" ON "budget_memberships"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_memberships_userId_groupId_key" ON "budget_memberships"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_plans_groupId_month_year_key" ON "monthly_plans"("groupId", "month", "year");

-- CreateIndex
CREATE INDEX "incomes_monthlyPlanId_idx" ON "incomes"("monthlyPlanId");

-- CreateIndex
CREATE INDEX "planned_expenses_monthlyPlanId_idx" ON "planned_expenses"("monthlyPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_shares_plannedExpenseId_userId_key" ON "expense_shares"("plannedExpenseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_name_key" ON "expense_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "envelopes_monthlyPlanId_categoryId_key" ON "envelopes"("monthlyPlanId", "categoryId");

-- CreateIndex
CREATE INDEX "envelope_entries_envelopeId_idx" ON "envelope_entries"("envelopeId");

-- AddForeignKey
ALTER TABLE "budget_memberships" ADD CONSTRAINT "budget_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_memberships" ADD CONSTRAINT "budget_memberships_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "budget_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "budget_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "monthly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_expenses" ADD CONSTRAINT "planned_expenses_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "monthly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_expenses" ADD CONSTRAINT "planned_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_expenses" ADD CONSTRAINT "planned_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_plannedExpenseId_fkey" FOREIGN KEY ("plannedExpenseId") REFERENCES "planned_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envelopes" ADD CONSTRAINT "envelopes_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "monthly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envelopes" ADD CONSTRAINT "envelopes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envelope_entries" ADD CONSTRAINT "envelope_entries_envelopeId_fkey" FOREIGN KEY ("envelopeId") REFERENCES "envelopes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envelope_entries" ADD CONSTRAINT "envelope_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

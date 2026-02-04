import type { UserPlanSummary, PlanSummary } from "./types.ts";
import { BASIS_POINTS_TOTAL } from "./constants.ts";

interface IncomeData {
  userId: string;
  amount: number;
}

interface ExpenseData {
  userId: string | null;
  amount: number;
  scope: "personal" | "common";
  shares: Array<{ userId: string; percentage: number }>;
}

interface EnvelopeData {
  allocatedAmount: number;
  entries: Array<{ userId: string; amount: number }>;
}

export function computePlanSummary(
  memberIds: string[],
  incomes: IncomeData[],
  expenses: ExpenseData[],
  envelopes: EnvelopeData[],
): PlanSummary {
  const perUser: UserPlanSummary[] = memberIds.map((userId) => {
    const totalIncome = incomes
      .filter((i) => i.userId === userId)
      .reduce((sum, i) => sum + i.amount, 0);

    const personalExpenses = expenses
      .filter((e) => e.scope === "personal" && e.userId === userId)
      .reduce((sum, e) => sum + e.amount, 0);

    const commonExpenseShare = expenses
      .filter((e) => e.scope === "common")
      .reduce((sum, e) => {
        const share = e.shares.find((s) => s.userId === userId);
        if (share) {
          return sum + Math.round((e.amount * share.percentage) / BASIS_POINTS_TOTAL);
        }
        return sum;
      }, 0);

    const totalExpenses = personalExpenses + commonExpenseShare;
    const savings = totalIncome - totalExpenses;

    const envelopeSpent = envelopes.reduce(
      (sum, env) =>
        sum +
        env.entries
          .filter((e) => e.userId === userId)
          .reduce((s, e) => s + e.amount, 0),
      0,
    );

    const envelopeAllocated = envelopes.reduce(
      (sum, env) => sum + env.allocatedAmount,
      0,
    );

    return {
      userId,
      totalIncome,
      personalExpenses,
      commonExpenseShare,
      totalExpenses,
      savings,
      envelopeSpent,
      envelopeAllocated,
    };
  });

  const totalIncome = perUser.reduce((sum, u) => sum + u.totalIncome, 0);
  const totalExpenses = perUser.reduce((sum, u) => sum + u.totalExpenses, 0);
  const totalSavings = perUser.reduce((sum, u) => sum + u.savings, 0);

  return { totalIncome, totalExpenses, totalSavings, perUser };
}

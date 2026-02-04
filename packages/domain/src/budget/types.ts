import type {
  ExpenseScope,
  ExpenseRecurrence,
  ExpenseStatus,
} from "@personal-os/database";

// ── Budget Group ────────────────────────────────────────────────

export interface CreateBudgetGroupInput {
  name: string;
}

export interface UpdateBudgetGroupInput {
  name?: string;
}

export interface AddGroupMemberInput {
  email: string;
}

// ── Expense Category ────────────────────────────────────────────

export interface CreateExpenseCategoryInput {
  name: string;
  icon?: string;
}

// ── Monthly Plan ────────────────────────────────────────────────

export interface CreateMonthlyPlanInput {
  month: number;
  year: number;
  prefillFromPrevious?: boolean;
}

// ── Income ──────────────────────────────────────────────────────

export interface CreateIncomeInput {
  source: string;
  amount: number;
}

export interface UpdateIncomeInput {
  source?: string;
  amount?: number;
}

// ── Planned Expense ─────────────────────────────────────────────

export interface CreatePlannedExpenseInput {
  name: string;
  amount: number;
  scope?: ExpenseScope;
  recurrence?: ExpenseRecurrence;
  categoryId?: string;
}

export interface UpdatePlannedExpenseInput {
  name?: string;
  amount?: number;
  scope?: ExpenseScope;
  recurrence?: ExpenseRecurrence;
  categoryId?: string | null;
}

export interface UpdateExpenseStatusInput {
  status: ExpenseStatus;
}

export interface ExpenseShareInput {
  userId: string;
  percentage: number;
}

export interface CreateSharedExpenseInput {
  name: string;
  amount: number;
  categoryId?: string;
  shares: ExpenseShareInput[];
}

// ── Envelope ────────────────────────────────────────────────────

export interface CreateEnvelopeInput {
  categoryId: string;
  allocatedAmount: number;
}

export interface UpdateEnvelopeInput {
  allocatedAmount?: number;
}

// ── Envelope Entry ──────────────────────────────────────────────

export interface CreateEnvelopeEntryInput {
  amount: number;
  note?: string;
  date: string;
}

// ── Summary ─────────────────────────────────────────────────────

export interface UserPlanSummary {
  userId: string;
  totalIncome: number;
  personalExpenses: number;
  commonExpenseShare: number;
  totalExpenses: number;
  savings: number;
  envelopeSpent: number;
  envelopeAllocated: number;
}

export interface PlanSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  perUser: UserPlanSummary[];
}

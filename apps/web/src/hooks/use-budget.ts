import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import type {
  BudgetGroup,
  BudgetMembership,
  MonthlyPlan,
  Income,
  PlannedExpense,
  ExpenseCategory,
  CreateBudgetGroupInput,
  UpdateBudgetGroupInput,
  AddGroupMemberInput,
  CreateMonthlyPlanInput,
  CreateIncomeInput,
  UpdateIncomeInput,
  CreatePlannedExpenseInput,
  UpdatePlannedExpenseInput,
  UpdateExpenseStatusInput,
  CreateSharedExpenseInput,
  CreateExpenseCategoryInput,
  PlanSummary,
} from "@personal-os/domain";

type UserInfo = { id: string; email: string; name: string | null };

export type BudgetGroupWithMembers = BudgetGroup & {
  members: (BudgetMembership & { user: UserInfo })[];
};

export type MonthlyPlanFull = MonthlyPlan & {
  incomes: (Income & { user: UserInfo })[];
  expenses: (PlannedExpense & {
    user: UserInfo | null;
    category: ExpenseCategory | null;
    shares: Array<{ id: string; userId: string; percentage: number; user: UserInfo }>;
  })[];
  envelopes: Array<{
    id: string;
    categoryId: string;
    allocatedAmount: number;
    category: ExpenseCategory;
    entries: Array<{
      id: string;
      userId: string;
      amount: number;
      note: string | null;
      date: string;
      user: UserInfo;
    }>;
  }>;
};

// ── Query Keys ──────────────────────────────────────────────────

export const budgetKeys = {
  groups: ["budget", "groups"] as const,
  group: (id: string) => ["budget", "groups", id] as const,
  plans: (groupId: string) => ["budget", "groups", groupId, "plans"] as const,
  plan: (groupId: string, planId: string) =>
    ["budget", "groups", groupId, "plans", planId] as const,
  planSummary: (groupId: string, planId: string) =>
    ["budget", "groups", groupId, "plans", planId, "summary"] as const,
  incomes: (groupId: string, planId: string) =>
    ["budget", "groups", groupId, "plans", planId, "incomes"] as const,
  expenses: (groupId: string, planId: string) =>
    ["budget", "groups", groupId, "plans", planId, "expenses"] as const,
  categories: ["budget", "categories"] as const,
};

// ── Groups ──────────────────────────────────────────────────────

export function useBudgetGroups() {
  return useQuery({
    queryKey: budgetKeys.groups,
    queryFn: () => apiGet<BudgetGroupWithMembers[]>("budget/groups"),
  });
}

export function useBudgetGroup(groupId: string) {
  return useQuery({
    queryKey: budgetKeys.group(groupId),
    queryFn: () => apiGet<BudgetGroupWithMembers>(`budget/groups/${groupId}`),
    enabled: !!groupId,
  });
}

export function useCreateBudgetGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetGroupInput) =>
      apiPost<BudgetGroupWithMembers>("budget/groups", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.groups }),
  });
}

export function useUpdateBudgetGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBudgetGroupInput) =>
      apiPatch<BudgetGroupWithMembers>(`budget/groups/${groupId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.groups });
      qc.invalidateQueries({ queryKey: budgetKeys.group(groupId) });
    },
  });
}

export function useAddGroupMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddGroupMemberInput) =>
      apiPost<BudgetGroupWithMembers>(`budget/groups/${groupId}/members`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.groups });
      qc.invalidateQueries({ queryKey: budgetKeys.group(groupId) });
    },
  });
}

export function useRemoveGroupMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiDelete<BudgetGroupWithMembers>(`budget/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.groups });
      qc.invalidateQueries({ queryKey: budgetKeys.group(groupId) });
    },
  });
}

// ── Categories ──────────────────────────────────────────────────

export function useExpenseCategories() {
  return useQuery({
    queryKey: budgetKeys.categories,
    queryFn: () => apiGet<ExpenseCategory[]>("budget/categories"),
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseCategoryInput) =>
      apiPost<ExpenseCategory>("budget/categories", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.categories }),
  });
}

// ── Monthly Plans ───────────────────────────────────────────────

export function useMonthlyPlans(groupId: string) {
  return useQuery({
    queryKey: budgetKeys.plans(groupId),
    queryFn: () => apiGet<MonthlyPlan[]>(`budget/groups/${groupId}/plans`),
    enabled: !!groupId,
  });
}

export function useMonthlyPlan(groupId: string, planId: string) {
  return useQuery({
    queryKey: budgetKeys.plan(groupId, planId),
    queryFn: () =>
      apiGet<MonthlyPlanFull>(`budget/groups/${groupId}/plans/${planId}`),
    enabled: !!groupId && !!planId,
  });
}

export function useCreateMonthlyPlan(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMonthlyPlanInput) =>
      apiPost<MonthlyPlanFull>(`budget/groups/${groupId}/plans`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.plans(groupId) }),
  });
}

export function usePlanSummary(groupId: string, planId: string) {
  return useQuery({
    queryKey: budgetKeys.planSummary(groupId, planId),
    queryFn: () =>
      apiGet<PlanSummary>(`budget/groups/${groupId}/plans/${planId}/summary`),
    enabled: !!groupId && !!planId,
  });
}

// ── Incomes ─────────────────────────────────────────────────────

export function useCreateIncome(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIncomeInput) =>
      apiPost(`budget/groups/${groupId}/plans/${planId}/incomes`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useUpdateIncome(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateIncomeInput & { id: string }) =>
      apiPatch(`budget/groups/${groupId}/plans/${planId}/incomes/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useDeleteIncome(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(`budget/groups/${groupId}/plans/${planId}/incomes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

// ── Expenses ────────────────────────────────────────────────────

export function useCreatePlannedExpense(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlannedExpenseInput) =>
      apiPost(`budget/groups/${groupId}/plans/${planId}/expenses`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useUpdatePlannedExpense(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdatePlannedExpenseInput & { id: string }) =>
      apiPatch(`budget/groups/${groupId}/plans/${planId}/expenses/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useUpdateExpenseStatus(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateExpenseStatusInput & { id: string }) =>
      apiPatch(`budget/groups/${groupId}/plans/${planId}/expenses/${id}/status`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useDeletePlannedExpense(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(`budget/groups/${groupId}/plans/${planId}/expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useCreateSharedExpense(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSharedExpenseInput) =>
      apiPost(`budget/groups/${groupId}/plans/${planId}/expenses/shared`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.plan(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

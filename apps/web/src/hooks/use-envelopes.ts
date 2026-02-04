import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import { budgetKeys } from "./use-budget";
import type {
  CreateEnvelopeInput,
  UpdateEnvelopeInput,
  CreateEnvelopeEntryInput,
  ExpenseCategory,
} from "@personal-os/domain";

interface EnvelopeWithDetails {
  id: string;
  monthlyPlanId: string;
  categoryId: string;
  allocatedAmount: number;
  spent: number;
  remaining: number;
  category: ExpenseCategory;
  entries: Array<{
    id: string;
    userId: string;
    amount: number;
    note: string | null;
    date: string;
    user: { id: string; email: string; name: string | null };
  }>;
}

export const envelopeKeys = {
  all: (groupId: string, planId: string) =>
    ["budget", "groups", groupId, "plans", planId, "envelopes"] as const,
  entries: (groupId: string, planId: string, envelopeId: string) =>
    [
      "budget", "groups", groupId, "plans", planId,
      "envelopes", envelopeId, "entries",
    ] as const,
};

export function useEnvelopes(groupId: string, planId: string) {
  return useQuery({
    queryKey: envelopeKeys.all(groupId, planId),
    queryFn: () =>
      apiGet<EnvelopeWithDetails[]>(
        `budget/groups/${groupId}/plans/${planId}/envelopes`,
      ),
    enabled: !!groupId && !!planId,
  });
}

export function useCreateEnvelope(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEnvelopeInput) =>
      apiPost(`budget/groups/${groupId}/plans/${planId}/envelopes`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: envelopeKeys.all(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useUpdateEnvelope(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateEnvelopeInput & { id: string }) =>
      apiPatch(`budget/groups/${groupId}/plans/${planId}/envelopes/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: envelopeKeys.all(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useDeleteEnvelope(groupId: string, planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(`budget/groups/${groupId}/plans/${planId}/envelopes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: envelopeKeys.all(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useCreateEnvelopeEntry(
  groupId: string,
  planId: string,
  envelopeId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEnvelopeEntryInput) =>
      apiPost(
        `budget/groups/${groupId}/plans/${planId}/envelopes/${envelopeId}/entries`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: envelopeKeys.all(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

export function useDeleteEnvelopeEntry(
  groupId: string,
  planId: string,
  envelopeId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(
        `budget/groups/${groupId}/plans/${planId}/envelopes/${envelopeId}/entries/${id}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: envelopeKeys.all(groupId, planId) });
      qc.invalidateQueries({ queryKey: budgetKeys.planSummary(groupId, planId) });
    },
  });
}

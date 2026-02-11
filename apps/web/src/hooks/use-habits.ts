import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost, apiDelete } from "../lib/api-client";
import type {
  Habit,
  HabitEntry,
  CreateHabitInput,
  UpdateHabitInput,
} from "@personal-os/domain";

export type HabitWithEntries = Habit & { entries: HabitEntry[] };

export interface HabitDaySummary {
  date: string;
  completed: number;
  total: number;
}

export const habitKeys = {
  all: ["habits"] as const,
  byDate: (date: string) => ["habits", "date", date] as const,
  summary: (from: string, to: string) =>
    ["habits", "summary", from, to] as const,
  detail: (id: string) => ["habits", id] as const,
};

export function useHabits() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: () => apiGet<HabitWithEntries[]>("habits"),
  });
}

export function useHabitsByDate(date: string) {
  return useQuery({
    queryKey: habitKeys.byDate(date),
    queryFn: () => apiGet<HabitWithEntries[]>(`habits?date=${date}`),
  });
}

export function useHabitsSummary(from: string, to: string) {
  return useQuery({
    queryKey: habitKeys.summary(from, to),
    queryFn: () =>
      apiGet<HabitDaySummary[]>(`habits/summary?from=${from}&to=${to}`),
    enabled: !!from && !!to,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHabitInput) =>
      apiPost<Habit>("habits", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateHabitInput & { id: string }) =>
      apiPatch<Habit>(`habits/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`habits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useLogHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      habitId,
      date,
      completed,
    }: {
      habitId: string;
      date: string;
      completed: boolean;
    }) => apiPost<HabitEntry>(`habits/${habitId}/entries`, { date, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

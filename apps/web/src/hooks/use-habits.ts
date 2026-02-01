import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../lib/api-client";
import type {
  Habit,
  HabitEntry,
  CreateHabitInput,
  UpdateHabitInput,
} from "@personal-os/domain";

export type HabitWithEntries = Habit & { entries: HabitEntry[] };

export const habitKeys = {
  all: ["habits"] as const,
  detail: (id: string) => ["habits", id] as const,
};

export function useHabits() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: () => apiGet<HabitWithEntries[]>("habits"),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHabitInput) =>
      apiPost<Habit>("habits", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateHabitInput & { id: string }) =>
      apiPatch<Habit>(`habits/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
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
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import type {
  Household,
  HouseholdMember,
  Pet,
  RoutineTemplate,
  DailyChecklistItem,
  ActivityLog,
  WeightEntry,
  VetVisit,
  Vaccination,
  Medication,
  TrainingMilestone,
  CreateHouseholdInput,
  UpdateHouseholdInput,
  AddHouseholdMemberInput,
  CreatePetInput,
  UpdatePetInput,
  CreateRoutineTemplateInput,
  UpdateRoutineTemplateInput,
  CreateActivityLogInput,
  CreateWeightEntryInput,
  CreateVetVisitInput,
  CreateVaccinationInput,
  CreateMedicationInput,
  CreateTrainingMilestoneInput,
  UpdateTrainingMilestoneInput,
  ActivityType,
} from "@personal-os/domain";

export type HouseholdWithMembers = Household & {
  members: (HouseholdMember & { user: UserInfo })[];
  pets: Pet[];
};

// ── Query Keys ──────────────────────────────────────────────────

type UserInfo = { id: string; email: string; name: string | null };

export type ChecklistItemFull = DailyChecklistItem & {
  template: RoutineTemplate;
  completedBy: UserInfo | null;
  duplicateWarning?: string;
};

export type TodayChecklist = {
  pet: Pet;
  items: ChecklistItemFull[];
};

export const puppyKeys = {
  households: ["puppy", "households"] as const,
  household: (id: string) => ["puppy", "households", id] as const,
  pets: (householdId: string) =>
    ["puppy", "households", householdId, "pets"] as const,
  pet: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId] as const,
  routines: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "routines"] as const,
  checklist: (householdId: string, petId: string, date: string) =>
    ["puppy", "households", householdId, "pets", petId, "checklist", date] as const,
  today: (householdId: string) =>
    ["puppy", "households", householdId, "today"] as const,
  activities: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "activities"] as const,
  weights: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "weights"] as const,
  vetVisits: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "vet-visits"] as const,
  vaccinations: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "vaccinations"] as const,
  medications: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "medications"] as const,
  training: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "training"] as const,
  dashboard: (householdId: string, petId: string) =>
    ["puppy", "households", householdId, "pets", petId, "dashboard"] as const,
};

// ── Households ──────────────────────────────────────────────────

export function useHouseholds() {
  return useQuery({
    queryKey: puppyKeys.households,
    queryFn: () => apiGet<HouseholdWithMembers[]>("puppy/households"),
  });
}

export function useHousehold(householdId: string) {
  return useQuery({
    queryKey: puppyKeys.household(householdId),
    queryFn: () =>
      apiGet<HouseholdWithMembers>(`puppy/households/${householdId}`),
    enabled: !!householdId,
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHouseholdInput) =>
      apiPost<HouseholdWithMembers>("puppy/households", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: puppyKeys.households }),
  });
}

export function useUpdateHousehold(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateHouseholdInput) =>
      apiPatch<HouseholdWithMembers>(
        `puppy/households/${householdId}`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.households });
      qc.invalidateQueries({ queryKey: puppyKeys.household(householdId) });
    },
  });
}

export function useAddHouseholdMember(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddHouseholdMemberInput) =>
      apiPost<HouseholdWithMembers>(
        `puppy/households/${householdId}/members`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.households });
      qc.invalidateQueries({ queryKey: puppyKeys.household(householdId) });
    },
  });
}

export function useRemoveHouseholdMember(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiDelete<HouseholdWithMembers>(
        `puppy/households/${householdId}/members/${userId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.households });
      qc.invalidateQueries({ queryKey: puppyKeys.household(householdId) });
    },
  });
}

// ── Pets ────────────────────────────────────────────────────────

export function usePets(householdId: string) {
  return useQuery({
    queryKey: puppyKeys.pets(householdId),
    queryFn: () =>
      apiGet<Pet[]>(`puppy/households/${householdId}/pets`),
    enabled: !!householdId,
  });
}

export function usePet(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.pet(householdId, petId),
    queryFn: () =>
      apiGet<Pet>(`puppy/households/${householdId}/pets/${petId}`),
    enabled: !!householdId && !!petId,
  });
}

export function useCreatePet(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePetInput) =>
      apiPost<Pet>(`puppy/households/${householdId}/pets`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.pets(householdId) });
      qc.invalidateQueries({ queryKey: puppyKeys.household(householdId) });
    },
  });
}

export function useUpdatePet(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePetInput) =>
      apiPatch<Pet>(`puppy/households/${householdId}/pets/${petId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.pets(householdId) });
      qc.invalidateQueries({
        queryKey: puppyKeys.pet(householdId, petId),
      });
      qc.invalidateQueries({ queryKey: puppyKeys.household(householdId) });
    },
  });
}

export function useDeletePet(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (petId: string) =>
      apiDelete(`puppy/households/${householdId}/pets/${petId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.pets(householdId) });
      qc.invalidateQueries({ queryKey: puppyKeys.household(householdId) });
    },
  });
}

// ── Routine Templates ───────────────────────────────────────────

export function useRoutineTemplates(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.routines(householdId, petId),
    queryFn: () =>
      apiGet<RoutineTemplate[]>(
        `puppy/households/${householdId}/pets/${petId}/routines`,
      ),
    enabled: !!householdId && !!petId,
  });
}

export function useCreateRoutineTemplate(
  householdId: string,
  petId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoutineTemplateInput) =>
      apiPost<RoutineTemplate>(
        `puppy/households/${householdId}/pets/${petId}/routines`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.routines(householdId, petId),
      });
      qc.invalidateQueries({ queryKey: puppyKeys.today(householdId) });
    },
  });
}

export function useUpdateRoutineTemplate(
  householdId: string,
  petId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: UpdateRoutineTemplateInput & { id: string }) =>
      apiPatch<RoutineTemplate>(
        `puppy/households/${householdId}/pets/${petId}/routines/${id}`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.routines(householdId, petId),
      });
      qc.invalidateQueries({ queryKey: puppyKeys.today(householdId) });
    },
  });
}

export function useDeleteRoutineTemplate(
  householdId: string,
  petId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/routines/${templateId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.routines(householdId, petId),
      });
      qc.invalidateQueries({ queryKey: puppyKeys.today(householdId) });
    },
  });
}

// ── Daily Checklist ─────────────────────────────────────────────

export function useTodayChecklist(householdId: string) {
  return useQuery({
    queryKey: puppyKeys.today(householdId),
    queryFn: () =>
      apiGet<TodayChecklist[]>(`puppy/households/${householdId}/today`),
    enabled: !!householdId,
  });
}

export function useToggleChecklistItem(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiPatch<ChecklistItemFull>(
        `puppy/households/${householdId}/pets/${petId}/checklist/${itemId}`,
        {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: puppyKeys.today(householdId) });
    },
  });
}

// ── Activity Log ────────────────────────────────────────────────

export type ActivityLogFull = ActivityLog & {
  user: UserInfo;
};

export function useActivityLogs(
  householdId: string,
  petId: string,
  filters?: { type?: ActivityType },
) {
  return useQuery({
    queryKey: [...puppyKeys.activities(householdId, petId), filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.type) params.set("type", filters.type);
      const qs = params.toString();
      return apiGet<ActivityLogFull[]>(
        `puppy/households/${householdId}/pets/${petId}/activities${qs ? `?${qs}` : ""}`,
      );
    },
    enabled: !!householdId && !!petId,
  });
}

export function useCreateActivityLog(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityLogInput) =>
      apiPost<ActivityLogFull>(
        `puppy/households/${householdId}/pets/${petId}/activities`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.activities(householdId, petId),
      });
      qc.invalidateQueries({ queryKey: puppyKeys.today(householdId) });
    },
  });
}

export function useDeleteActivityLog(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/activities/${logId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.activities(householdId, petId),
      });
    },
  });
}

// ── Weight Entries ──────────────────────────────────────────────

export function useWeightEntries(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.weights(householdId, petId),
    queryFn: () =>
      apiGet<WeightEntry[]>(
        `puppy/households/${householdId}/pets/${petId}/weights`,
      ),
    enabled: !!householdId && !!petId,
  });
}

export function useCreateWeightEntry(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWeightEntryInput) =>
      apiPost<WeightEntry>(
        `puppy/households/${householdId}/pets/${petId}/weights`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.weights(householdId, petId),
      });
    },
  });
}

export function useDeleteWeightEntry(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/weights/${entryId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.weights(householdId, petId),
      });
    },
  });
}

// ── Vet Visits ──────────────────────────────────────────────────

export function useVetVisits(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.vetVisits(householdId, petId),
    queryFn: () =>
      apiGet<VetVisit[]>(
        `puppy/households/${householdId}/pets/${petId}/vet-visits`,
      ),
    enabled: !!householdId && !!petId,
  });
}

export function useCreateVetVisit(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVetVisitInput) =>
      apiPost<VetVisit>(
        `puppy/households/${householdId}/pets/${petId}/vet-visits`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.vetVisits(householdId, petId),
      });
    },
  });
}

export function useDeleteVetVisit(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/vet-visits/${id}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.vetVisits(householdId, petId),
      });
    },
  });
}

// ── Vaccinations ────────────────────────────────────────────────

export function useVaccinations(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.vaccinations(householdId, petId),
    queryFn: () =>
      apiGet<Vaccination[]>(
        `puppy/households/${householdId}/pets/${petId}/vaccinations`,
      ),
    enabled: !!householdId && !!petId,
  });
}

export function useCreateVaccination(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVaccinationInput) =>
      apiPost<Vaccination>(
        `puppy/households/${householdId}/pets/${petId}/vaccinations`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.vaccinations(householdId, petId),
      });
    },
  });
}

export function useDeleteVaccination(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/vaccinations/${id}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.vaccinations(householdId, petId),
      });
    },
  });
}

// ── Medications ─────────────────────────────────────────────────

export function useMedications(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.medications(householdId, petId),
    queryFn: () =>
      apiGet<Medication[]>(
        `puppy/households/${householdId}/pets/${petId}/medications`,
      ),
    enabled: !!householdId && !!petId,
  });
}

export function useCreateMedication(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMedicationInput) =>
      apiPost<Medication>(
        `puppy/households/${householdId}/pets/${petId}/medications`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.medications(householdId, petId),
      });
    },
  });
}

export function useDeleteMedication(householdId: string, petId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/medications/${id}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.medications(householdId, petId),
      });
    },
  });
}

// ── Training Milestones ─────────────────────────────────────────

export function useTrainingMilestones(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.training(householdId, petId),
    queryFn: () =>
      apiGet<TrainingMilestone[]>(
        `puppy/households/${householdId}/pets/${petId}/training`,
      ),
    enabled: !!householdId && !!petId,
  });
}

export function useCreateTrainingMilestone(
  householdId: string,
  petId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTrainingMilestoneInput) =>
      apiPost<TrainingMilestone>(
        `puppy/households/${householdId}/pets/${petId}/training`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.training(householdId, petId),
      });
    },
  });
}

export function useUpdateTrainingMilestone(
  householdId: string,
  petId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: UpdateTrainingMilestoneInput & { id: string }) =>
      apiPatch<TrainingMilestone>(
        `puppy/households/${householdId}/pets/${petId}/training/${id}`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.training(householdId, petId),
      });
    },
  });
}

export function useDeleteTrainingMilestone(
  householdId: string,
  petId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(
        `puppy/households/${householdId}/pets/${petId}/training/${id}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: puppyKeys.training(householdId, petId),
      });
    },
  });
}

// ── Dashboard ───────────────────────────────────────────────────

export type PetDashboard = {
  pet: Pet & { age: string | null; growthStage: string };
  latestWeight: WeightEntry | null;
  trainingProgress: { learned: number; total: number; percentage: number };
  upcomingReminders: Array<{
    type: "vaccination" | "vet";
    name: string;
    date: string | null;
  }>;
  activeMedications: Medication[];
  todayChecklist: { completed: number; total: number };
  lastActivity: {
    walk: (ActivityLog & { user: UserInfo }) | null;
    meal: (ActivityLog & { user: UserInfo }) | null;
  };
};

export function usePetDashboard(householdId: string, petId: string) {
  return useQuery({
    queryKey: puppyKeys.dashboard(householdId, petId),
    queryFn: () =>
      apiGet<PetDashboard>(
        `puppy/households/${householdId}/pets/${petId}/dashboard`,
      ),
    enabled: !!householdId && !!petId,
  });
}

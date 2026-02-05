import type {
  ActivityType,
  TrainingStatus,
  MedicationFrequency,
} from "@personal-os/database";

// ── Household ───────────────────────────────────────────────────

export interface CreateHouseholdInput {
  name: string;
}

export interface UpdateHouseholdInput {
  name?: string;
}

export interface AddHouseholdMemberInput {
  email: string;
}

// ── Pet ─────────────────────────────────────────────────────────

export interface CreatePetInput {
  name: string;
  breed?: string;
  birthDate?: string;
  photoUrl?: string;
}

export interface UpdatePetInput {
  name?: string;
  breed?: string | null;
  birthDate?: string | null;
  photoUrl?: string | null;
}

// ── Routine Template ────────────────────────────────────────────

export interface CreateRoutineTemplateInput {
  name: string;
  time: string;
  type: ActivityType;
  sortOrder?: number;
}

export interface UpdateRoutineTemplateInput {
  name?: string;
  time?: string;
  type?: ActivityType;
  sortOrder?: number;
}

// ── Activity Log ────────────────────────────────────────────────

export interface CreateActivityLogInput {
  type: ActivityType;
  duration?: number;
  note?: string;
}

// ── Weight Entry ────────────────────────────────────────────────

export interface CreateWeightEntryInput {
  weight: number;
  date: string;
}

// ── Vet Visit ───────────────────────────────────────────────────

export interface CreateVetVisitInput {
  date: string;
  reason: string;
  notes?: string;
  nextVisitDate?: string;
}

export interface UpdateVetVisitInput {
  date?: string;
  reason?: string;
  notes?: string | null;
  nextVisitDate?: string | null;
}

// ── Vaccination ─────────────────────────────────────────────────

export interface CreateVaccinationInput {
  name: string;
  date: string;
  nextDueDate?: string;
}

export interface UpdateVaccinationInput {
  name?: string;
  date?: string;
  nextDueDate?: string | null;
}

// ── Medication ──────────────────────────────────────────────────

export interface CreateMedicationInput {
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateMedicationInput {
  name?: string;
  dosage?: string;
  frequency?: MedicationFrequency;
  startDate?: string;
  endDate?: string | null;
  notes?: string | null;
}

// ── Training Milestone ──────────────────────────────────────────

export interface CreateTrainingMilestoneInput {
  command: string;
  status?: TrainingStatus;
  notes?: string;
}

export interface UpdateTrainingMilestoneInput {
  command?: string;
  status?: TrainingStatus;
  notes?: string | null;
}

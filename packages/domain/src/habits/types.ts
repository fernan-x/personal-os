import type { HabitFrequency } from "@personal-os/database";

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
  customDays?: number[];
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
  customDays?: number[];
  isActive?: boolean;
}

export interface LogHabitEntryInput {
  habitId: string;
  date: Date;
  completed: boolean;
  note?: string;
}

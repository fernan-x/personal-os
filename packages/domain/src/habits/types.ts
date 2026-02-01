import type { HabitFrequency } from "@personal-os/database";

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
  isActive?: boolean;
}

export interface LogHabitEntryInput {
  habitId: string;
  date: Date;
  completed: boolean;
  note?: string;
}

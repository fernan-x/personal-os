import type { HabitFrequency } from "@personal-os/database";

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
}

export interface LogHabitEntryInput {
  habitId: string;
  date: Date;
  completed: boolean;
  note?: string;
}

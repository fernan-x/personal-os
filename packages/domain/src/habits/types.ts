import type { EntityId, Timestamps } from "../common/index.js";
import type { HabitFrequency } from "./constants.js";

export interface HabitDto extends Timestamps {
  id: EntityId;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  isActive: boolean;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
}

export interface HabitEntryDto {
  id: EntityId;
  habitId: EntityId;
  date: Date;
  completed: boolean;
  note: string | null;
  createdAt: Date;
}

export interface LogHabitEntryInput {
  habitId: EntityId;
  date: Date;
  completed: boolean;
  note?: string;
}

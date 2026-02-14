import type { ActivityLevel, FitnessGoal, Gender, MealSlot } from "@personal-os/database";

export interface NutritionalProfile {
  weight: number;
  height: number;
  birthDate: string;
  gender: Gender;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
}

export interface NutritionalProfileResponse {
  weight: number | null;
  height: number | null;
  birthDate: string | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  fitnessGoal: FitnessGoal | null;
}

export interface UpdateNutritionalProfileInput {
  weight?: number | null;
  height?: number | null;
  birthDate?: string | null;
  gender?: Gender | null;
  activityLevel?: ActivityLevel | null;
  fitnessGoal?: FitnessGoal | null;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SlotTargets {
  slot: MealSlot;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

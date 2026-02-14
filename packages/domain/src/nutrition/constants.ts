import type { ActivityLevel, FitnessGoal, Gender, MealSlot } from "@personal-os/database";

// ── Activity multipliers (Harris-Benedict / Mifflin) ────────

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// ── Goal adjustments (kcal/day) ─────────────────────────────

export const GOAL_CALORIE_ADJUSTMENTS: Record<FitnessGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

// ── Macro ratios (fraction of total calories) ───────────────

export const MACRO_RATIOS = {
  protein: 0.3,
  carbs: 0.4,
  fat: 0.3,
} as const;

// ── Slot calorie distribution ───────────────────────────────

export const SLOT_CALORIE_DISTRIBUTION: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
};

// ── Recipe matching tolerance ───────────────────────────────

export const CALORIE_TOLERANCE = 0.3;

// ── Enum arrays ─────────────────────────────────────────────

export const GENDERS: Gender[] = ["male", "female"];
export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
export const FITNESS_GOALS: FitnessGoal[] = ["lose", "maintain", "gain"];

// ── French labels ───────────────────────────────────────────

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Homme",
  female: "Femme",
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sédentaire",
  light: "Légèrement actif",
  moderate: "Modérément actif",
  active: "Actif",
  very_active: "Très actif",
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  lose: "Perdre du poids",
  maintain: "Maintenir",
  gain: "Prendre du poids",
};

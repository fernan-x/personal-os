import type { ActivityLevel, FitnessGoal, Gender, MealSlot } from "@personal-os/database";
import type { MacroTargets, SlotTargets } from "./types.ts";
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
  MACRO_RATIOS,
  SLOT_CALORIE_DISTRIBUTION,
} from "./constants.ts";

export function computeAge(birthDate: Date, referenceDate?: Date): number {
  const ref = referenceDate ?? new Date();
  let age = ref.getFullYear() - birthDate.getFullYear();
  const monthDiff = ref.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && ref.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function computeBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
): number {
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function computeDailyTargets(
  weight: number,
  height: number,
  birthDate: Date,
  gender: Gender,
  activityLevel: ActivityLevel,
  fitnessGoal: FitnessGoal,
): MacroTargets {
  const age = computeAge(birthDate);
  const bmr = computeBMR(weight, height, age, gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const adjusted = Math.max(1200, tdee + GOAL_CALORIE_ADJUSTMENTS[fitnessGoal]);
  const calories = Math.round(adjusted);

  return {
    calories,
    protein: Math.round((calories * MACRO_RATIOS.protein) / 4),
    carbs: Math.round((calories * MACRO_RATIOS.carbs) / 4),
    fat: Math.round((calories * MACRO_RATIOS.fat) / 9),
  };
}

export function distributeTargetsAcrossSlots(
  dailyTargets: MacroTargets,
  slots: MealSlot[],
): SlotTargets[] {
  // Re-normalize percentages for selected slots
  const totalPct = slots.reduce(
    (sum, slot) => sum + SLOT_CALORIE_DISTRIBUTION[slot],
    0,
  );

  return slots.map((slot) => {
    const ratio = SLOT_CALORIE_DISTRIBUTION[slot] / totalPct;
    return {
      slot,
      calories: Math.round(dailyTargets.calories * ratio),
      protein: Math.round(dailyTargets.protein * ratio),
      carbs: Math.round(dailyTargets.carbs * ratio),
      fat: Math.round(dailyTargets.fat * ratio),
    };
  });
}

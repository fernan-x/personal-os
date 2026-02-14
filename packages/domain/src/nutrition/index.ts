export type { Gender, ActivityLevel, FitnessGoal } from "@personal-os/database";
export type {
  NutritionalProfile,
  NutritionalProfileResponse,
  UpdateNutritionalProfileInput,
  MacroTargets,
  SlotTargets,
} from "./types.ts";
export {
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
  MACRO_RATIOS,
  SLOT_CALORIE_DISTRIBUTION,
  CALORIE_TOLERANCE,
  GENDERS,
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  GENDER_LABELS,
  ACTIVITY_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
} from "./constants.ts";
export {
  computeAge,
  computeBMR,
  computeDailyTargets,
  distributeTargetsAcrossSlots,
} from "./computations.ts";
export { validateUpdateNutritionalProfile } from "./validation.ts";

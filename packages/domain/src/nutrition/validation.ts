import type { ValidationError } from "../common/index.ts";
import type { UpdateNutritionalProfileInput } from "./types.ts";
import { GENDERS, ACTIVITY_LEVELS, FITNESS_GOALS } from "./constants.ts";

export function validateUpdateNutritionalProfile(
  input: UpdateNutritionalProfileInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.weight !== undefined && input.weight !== null) {
    if (typeof input.weight !== "number" || input.weight <= 0 || input.weight > 500) {
      errors.push({
        field: "weight",
        message: "Weight must be between 0 and 500 kg",
      });
    }
  }

  if (input.height !== undefined && input.height !== null) {
    if (typeof input.height !== "number" || input.height <= 0 || input.height > 300) {
      errors.push({
        field: "height",
        message: "Height must be between 0 and 300 cm",
      });
    }
  }

  if (input.birthDate !== undefined && input.birthDate !== null) {
    const date = new Date(input.birthDate);
    if (isNaN(date.getTime())) {
      errors.push({
        field: "birthDate",
        message: "Birth date must be a valid date",
      });
    }
  }

  if (input.gender !== undefined && input.gender !== null) {
    if (!(GENDERS as readonly string[]).includes(input.gender)) {
      errors.push({
        field: "gender",
        message: `Gender must be one of: ${GENDERS.join(", ")}`,
      });
    }
  }

  if (input.activityLevel !== undefined && input.activityLevel !== null) {
    if (!(ACTIVITY_LEVELS as readonly string[]).includes(input.activityLevel)) {
      errors.push({
        field: "activityLevel",
        message: `Activity level must be one of: ${ACTIVITY_LEVELS.join(", ")}`,
      });
    }
  }

  if (input.fitnessGoal !== undefined && input.fitnessGoal !== null) {
    if (!(FITNESS_GOALS as readonly string[]).includes(input.fitnessGoal)) {
      errors.push({
        field: "fitnessGoal",
        message: `Fitness goal must be one of: ${FITNESS_GOALS.join(", ")}`,
      });
    }
  }

  return errors;
}

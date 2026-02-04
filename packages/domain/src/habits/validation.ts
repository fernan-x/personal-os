import type { HabitFrequency } from "@personal-os/database";
import type { ValidationError } from "../common/index.ts";
import {
  HABIT_FREQUENCIES,
  HABIT_NAME_MAX_LENGTH,
  HABIT_DESCRIPTION_MAX_LENGTH,
} from "./constants.ts";
import type { CreateHabitInput, UpdateHabitInput } from "./types.ts";

export function isValidHabitFrequency(value: string): value is HabitFrequency {
  return (HABIT_FREQUENCIES as readonly string[]).includes(value);
}

export function validateCreateHabit(
  input: CreateHabitInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > HABIT_NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${HABIT_NAME_MAX_LENGTH} characters`,
    });
  }

  if (
    input.description &&
    input.description.length > HABIT_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push({
      field: "description",
      message: `Description must be at most ${HABIT_DESCRIPTION_MAX_LENGTH} characters`,
    });
  }

  if (input.frequency && !isValidHabitFrequency(input.frequency)) {
    errors.push({
      field: "frequency",
      message: `Frequency must be one of: ${HABIT_FREQUENCIES.join(", ")}`,
    });
  }

  return errors;
}

export function validateUpdateHabit(
  input: UpdateHabitInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (input.name.length > HABIT_NAME_MAX_LENGTH) {
      errors.push({
        field: "name",
        message: `Name must be at most ${HABIT_NAME_MAX_LENGTH} characters`,
      });
    }
  }

  if (
    input.description !== undefined &&
    input.description !== null &&
    input.description.length > HABIT_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push({
      field: "description",
      message: `Description must be at most ${HABIT_DESCRIPTION_MAX_LENGTH} characters`,
    });
  }

  if (input.frequency !== undefined && !isValidHabitFrequency(input.frequency)) {
    errors.push({
      field: "frequency",
      message: `Frequency must be one of: ${HABIT_FREQUENCIES.join(", ")}`,
    });
  }

  return errors;
}

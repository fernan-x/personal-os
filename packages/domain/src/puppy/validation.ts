import type { ValidationError } from "../common/index.ts";
import type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
  AddHouseholdMemberInput,
  CreatePetInput,
  UpdatePetInput,
  CreateRoutineTemplateInput,
  UpdateRoutineTemplateInput,
  CreateActivityLogInput,
  CreateWeightEntryInput,
  CreateVetVisitInput,
  UpdateVetVisitInput,
  CreateVaccinationInput,
  UpdateVaccinationInput,
  CreateMedicationInput,
  UpdateMedicationInput,
  CreateTrainingMilestoneInput,
  UpdateTrainingMilestoneInput,
} from "./types.ts";
import {
  HOUSEHOLD_NAME_MAX_LENGTH,
  PET_NAME_MAX_LENGTH,
  PET_BREED_MAX_LENGTH,
  ROUTINE_NAME_MAX_LENGTH,
  ACTIVITY_NOTE_MAX_LENGTH,
  VET_REASON_MAX_LENGTH,
  VET_NOTES_MAX_LENGTH,
  VACCINE_NAME_MAX_LENGTH,
  MED_NAME_MAX_LENGTH,
  MED_DOSAGE_MAX_LENGTH,
  MED_NOTES_MAX_LENGTH,
  TRAINING_COMMAND_MAX_LENGTH,
  TRAINING_NOTES_MAX_LENGTH,
  ACTIVITY_TYPES,
  TRAINING_STATUSES,
  MEDICATION_FREQUENCIES,
} from "./constants.ts";

// ── Helpers ─────────────────────────────────────────────────────

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateRequiredString(
  value: unknown,
  field: string,
  maxLength: number,
  errors: ValidationError[],
): void {
  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    errors.push({ field, message: `${field} is required` });
  } else if (typeof value === "string" && value.length > maxLength) {
    errors.push({
      field,
      message: `${field} must be at most ${maxLength} characters`,
    });
  }
}

function validateOptionalString(
  value: unknown,
  field: string,
  maxLength: number,
  errors: ValidationError[],
): void {
  if (value !== undefined && value !== null && typeof value === "string") {
    if (value.trim().length === 0) {
      errors.push({ field, message: `${field} cannot be empty` });
    } else if (value.length > maxLength) {
      errors.push({
        field,
        message: `${field} must be at most ${maxLength} characters`,
      });
    }
  }
}

function validateDate(
  value: unknown,
  field: string,
  required: boolean,
  errors: ValidationError[],
): void {
  if (required && !value) {
    errors.push({ field, message: `${field} is required` });
  } else if (value !== undefined && value !== null) {
    if (typeof value !== "string" || !DATE_REGEX.test(value)) {
      errors.push({ field, message: `${field} must be a valid date (YYYY-MM-DD)` });
    }
  }
}

// ── Household ───────────────────────────────────────────────────

export function validateCreateHousehold(
  input: CreateHouseholdInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateRequiredString(input.name, "name", HOUSEHOLD_NAME_MAX_LENGTH, errors);
  return errors;
}

export function validateUpdateHousehold(
  input: UpdateHouseholdInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.name !== undefined) {
    validateRequiredString(input.name, "name", HOUSEHOLD_NAME_MAX_LENGTH, errors);
  }
  return errors;
}

export function validateAddHouseholdMember(
  input: AddHouseholdMemberInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.email || input.email.trim().length === 0) {
    errors.push({ field: "email", message: "email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  return errors;
}

// ── Pet ─────────────────────────────────────────────────────────

export function validateCreatePet(
  input: CreatePetInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateRequiredString(input.name, "name", PET_NAME_MAX_LENGTH, errors);
  validateOptionalString(input.breed, "breed", PET_BREED_MAX_LENGTH, errors);
  validateDate(input.birthDate, "birthDate", false, errors);
  return errors;
}

export function validateUpdatePet(
  input: UpdatePetInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.name !== undefined) {
    validateRequiredString(input.name, "name", PET_NAME_MAX_LENGTH, errors);
  }
  if (input.breed !== undefined && input.breed !== null) {
    validateOptionalString(input.breed, "breed", PET_BREED_MAX_LENGTH, errors);
  }
  if (input.birthDate !== undefined && input.birthDate !== null) {
    validateDate(input.birthDate, "birthDate", false, errors);
  }
  return errors;
}

// ── Routine Template ────────────────────────────────────────────

export function validateCreateRoutineTemplate(
  input: CreateRoutineTemplateInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateRequiredString(input.name, "name", ROUTINE_NAME_MAX_LENGTH, errors);

  if (!input.time) {
    errors.push({ field: "time", message: "time is required" });
  } else if (!TIME_REGEX.test(input.time)) {
    errors.push({ field: "time", message: "time must be in HH:mm format" });
  }

  if (!input.type) {
    errors.push({ field: "type", message: "type is required" });
  } else if (!(ACTIVITY_TYPES as readonly string[]).includes(input.type)) {
    errors.push({
      field: "type",
      message: `type must be one of: ${ACTIVITY_TYPES.join(", ")}`,
    });
  }

  return errors;
}

export function validateUpdateRoutineTemplate(
  input: UpdateRoutineTemplateInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    validateRequiredString(input.name, "name", ROUTINE_NAME_MAX_LENGTH, errors);
  }

  if (input.time !== undefined) {
    if (!TIME_REGEX.test(input.time)) {
      errors.push({ field: "time", message: "time must be in HH:mm format" });
    }
  }

  if (input.type !== undefined) {
    if (!(ACTIVITY_TYPES as readonly string[]).includes(input.type)) {
      errors.push({
        field: "type",
        message: `type must be one of: ${ACTIVITY_TYPES.join(", ")}`,
      });
    }
  }

  return errors;
}

// ── Activity Log ────────────────────────────────────────────────

export function validateCreateActivityLog(
  input: CreateActivityLogInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.type) {
    errors.push({ field: "type", message: "type is required" });
  } else if (!(ACTIVITY_TYPES as readonly string[]).includes(input.type)) {
    errors.push({
      field: "type",
      message: `type must be one of: ${ACTIVITY_TYPES.join(", ")}`,
    });
  }

  if (input.duration !== undefined) {
    if (!Number.isInteger(input.duration) || input.duration <= 0) {
      errors.push({ field: "duration", message: "duration must be a positive integer (minutes)" });
    }
  }

  if (input.note !== undefined && input.note !== null) {
    if (typeof input.note === "string" && input.note.length > ACTIVITY_NOTE_MAX_LENGTH) {
      errors.push({
        field: "note",
        message: `note must be at most ${ACTIVITY_NOTE_MAX_LENGTH} characters`,
      });
    }
  }

  return errors;
}

// ── Weight Entry ────────────────────────────────────────────────

export function validateCreateWeightEntry(
  input: CreateWeightEntryInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.weight === undefined || input.weight === null) {
    errors.push({ field: "weight", message: "weight is required" });
  } else if (!Number.isInteger(input.weight) || input.weight <= 0) {
    errors.push({ field: "weight", message: "weight must be a positive integer (grams)" });
  }

  validateDate(input.date, "date", true, errors);

  return errors;
}

// ── Vet Visit ───────────────────────────────────────────────────

export function validateCreateVetVisit(
  input: CreateVetVisitInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateDate(input.date, "date", true, errors);
  validateRequiredString(input.reason, "reason", VET_REASON_MAX_LENGTH, errors);
  if (input.notes !== undefined) {
    validateOptionalString(input.notes, "notes", VET_NOTES_MAX_LENGTH, errors);
  }
  validateDate(input.nextVisitDate, "nextVisitDate", false, errors);
  return errors;
}

export function validateUpdateVetVisit(
  input: UpdateVetVisitInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.date !== undefined) {
    validateDate(input.date, "date", true, errors);
  }
  if (input.reason !== undefined) {
    validateRequiredString(input.reason, "reason", VET_REASON_MAX_LENGTH, errors);
  }
  if (input.notes !== undefined && input.notes !== null) {
    validateOptionalString(input.notes, "notes", VET_NOTES_MAX_LENGTH, errors);
  }
  if (input.nextVisitDate !== undefined && input.nextVisitDate !== null) {
    validateDate(input.nextVisitDate, "nextVisitDate", false, errors);
  }
  return errors;
}

// ── Vaccination ─────────────────────────────────────────────────

export function validateCreateVaccination(
  input: CreateVaccinationInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateRequiredString(input.name, "name", VACCINE_NAME_MAX_LENGTH, errors);
  validateDate(input.date, "date", true, errors);
  validateDate(input.nextDueDate, "nextDueDate", false, errors);
  return errors;
}

export function validateUpdateVaccination(
  input: UpdateVaccinationInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.name !== undefined) {
    validateRequiredString(input.name, "name", VACCINE_NAME_MAX_LENGTH, errors);
  }
  if (input.date !== undefined) {
    validateDate(input.date, "date", true, errors);
  }
  if (input.nextDueDate !== undefined && input.nextDueDate !== null) {
    validateDate(input.nextDueDate, "nextDueDate", false, errors);
  }
  return errors;
}

// ── Medication ──────────────────────────────────────────────────

export function validateCreateMedication(
  input: CreateMedicationInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateRequiredString(input.name, "name", MED_NAME_MAX_LENGTH, errors);
  validateRequiredString(input.dosage, "dosage", MED_DOSAGE_MAX_LENGTH, errors);

  if (!input.frequency) {
    errors.push({ field: "frequency", message: "frequency is required" });
  } else if (!(MEDICATION_FREQUENCIES as readonly string[]).includes(input.frequency)) {
    errors.push({
      field: "frequency",
      message: `frequency must be one of: ${MEDICATION_FREQUENCIES.join(", ")}`,
    });
  }

  validateDate(input.startDate, "startDate", true, errors);
  validateDate(input.endDate, "endDate", false, errors);
  if (input.notes !== undefined) {
    validateOptionalString(input.notes, "notes", MED_NOTES_MAX_LENGTH, errors);
  }
  return errors;
}

export function validateUpdateMedication(
  input: UpdateMedicationInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.name !== undefined) {
    validateRequiredString(input.name, "name", MED_NAME_MAX_LENGTH, errors);
  }
  if (input.dosage !== undefined) {
    validateRequiredString(input.dosage, "dosage", MED_DOSAGE_MAX_LENGTH, errors);
  }
  if (input.frequency !== undefined) {
    if (!(MEDICATION_FREQUENCIES as readonly string[]).includes(input.frequency)) {
      errors.push({
        field: "frequency",
        message: `frequency must be one of: ${MEDICATION_FREQUENCIES.join(", ")}`,
      });
    }
  }
  if (input.startDate !== undefined) {
    validateDate(input.startDate, "startDate", true, errors);
  }
  if (input.endDate !== undefined && input.endDate !== null) {
    validateDate(input.endDate, "endDate", false, errors);
  }
  if (input.notes !== undefined && input.notes !== null) {
    validateOptionalString(input.notes, "notes", MED_NOTES_MAX_LENGTH, errors);
  }
  return errors;
}

// ── Training Milestone ──────────────────────────────────────────

export function validateCreateTrainingMilestone(
  input: CreateTrainingMilestoneInput,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateRequiredString(input.command, "command", TRAINING_COMMAND_MAX_LENGTH, errors);

  if (input.status !== undefined) {
    if (!(TRAINING_STATUSES as readonly string[]).includes(input.status)) {
      errors.push({
        field: "status",
        message: `status must be one of: ${TRAINING_STATUSES.join(", ")}`,
      });
    }
  }

  if (input.notes !== undefined) {
    validateOptionalString(input.notes, "notes", TRAINING_NOTES_MAX_LENGTH, errors);
  }

  return errors;
}

export function validateUpdateTrainingMilestone(
  input: UpdateTrainingMilestoneInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.command !== undefined) {
    validateRequiredString(input.command, "command", TRAINING_COMMAND_MAX_LENGTH, errors);
  }

  if (input.status !== undefined) {
    if (!(TRAINING_STATUSES as readonly string[]).includes(input.status)) {
      errors.push({
        field: "status",
        message: `status must be one of: ${TRAINING_STATUSES.join(", ")}`,
      });
    }
  }

  if (input.notes !== undefined && input.notes !== null) {
    validateOptionalString(input.notes, "notes", TRAINING_NOTES_MAX_LENGTH, errors);
  }

  return errors;
}

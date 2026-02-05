export const HOUSEHOLD_NAME_MAX_LENGTH = 100;
export const PET_NAME_MAX_LENGTH = 100;
export const PET_BREED_MAX_LENGTH = 100;
export const ROUTINE_NAME_MAX_LENGTH = 100;
export const ACTIVITY_NOTE_MAX_LENGTH = 1000;
export const VET_REASON_MAX_LENGTH = 200;
export const VET_NOTES_MAX_LENGTH = 2000;
export const VACCINE_NAME_MAX_LENGTH = 100;
export const MED_NAME_MAX_LENGTH = 100;
export const MED_DOSAGE_MAX_LENGTH = 100;
export const MED_NOTES_MAX_LENGTH = 1000;
export const TRAINING_COMMAND_MAX_LENGTH = 100;
export const TRAINING_NOTES_MAX_LENGTH = 1000;

export const MAX_HOUSEHOLD_MEMBERS = 2;

export const ACTIVITY_TYPES = [
  "meal",
  "walk",
  "potty",
  "sleep",
  "grooming",
  "medication",
  "other",
] as const;

export const TRAINING_STATUSES = [
  "not_started",
  "in_progress",
  "learned",
] as const;

export const MEDICATION_FREQUENCIES = [
  "once_daily",
  "twice_daily",
  "three_times_daily",
  "weekly",
  "as_needed",
] as const;

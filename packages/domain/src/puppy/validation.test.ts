import { describe, it, expect } from "vitest";
import {
  validateCreateHousehold,
  validateUpdateHousehold,
  validateAddHouseholdMember,
  validateCreatePet,
  validateUpdatePet,
  validateCreateRoutineTemplate,
  validateUpdateRoutineTemplate,
  validateCreateActivityLog,
  validateCreateWeightEntry,
  validateCreateVetVisit,
  validateUpdateVetVisit,
  validateCreateVaccination,
  validateUpdateVaccination,
  validateCreateMedication,
  validateUpdateMedication,
  validateCreateTrainingMilestone,
  validateUpdateTrainingMilestone,
} from "./validation.ts";

// ── Household ───────────────────────────────────────────────────

describe("validateCreateHousehold", () => {
  it("passes with valid name", () => {
    expect(validateCreateHousehold({ name: "Our Home" })).toEqual([]);
  });

  it("fails when name is empty", () => {
    const errors = validateCreateHousehold({ name: "" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("fails when name exceeds max length", () => {
    const errors = validateCreateHousehold({ name: "a".repeat(101) });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });
});

describe("validateUpdateHousehold", () => {
  it("passes with no fields", () => {
    expect(validateUpdateHousehold({})).toEqual([]);
  });

  it("fails when name is empty string", () => {
    const errors = validateUpdateHousehold({ name: "" });
    expect(errors).toHaveLength(1);
  });
});

describe("validateAddHouseholdMember", () => {
  it("passes with valid email", () => {
    expect(validateAddHouseholdMember({ email: "a@b.com" })).toEqual([]);
  });

  it("fails with empty email", () => {
    const errors = validateAddHouseholdMember({ email: "" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
  });

  it("fails with invalid email", () => {
    const errors = validateAddHouseholdMember({ email: "not-an-email" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
  });
});

// ── Pet ─────────────────────────────────────────────────────────

describe("validateCreatePet", () => {
  it("passes with just a name", () => {
    expect(validateCreatePet({ name: "Max" })).toEqual([]);
  });

  it("passes with all fields", () => {
    expect(
      validateCreatePet({
        name: "Max",
        breed: "Golden Retriever",
        birthDate: "2025-10-01",
      }),
    ).toEqual([]);
  });

  it("fails when name is empty", () => {
    const errors = validateCreatePet({ name: "" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("fails with invalid birthDate", () => {
    const errors = validateCreatePet({ name: "Max", birthDate: "bad" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("birthDate");
  });
});

describe("validateUpdatePet", () => {
  it("passes with no fields", () => {
    expect(validateUpdatePet({})).toEqual([]);
  });

  it("allows null breed to clear it", () => {
    expect(validateUpdatePet({ breed: null })).toEqual([]);
  });
});

// ── Routine Template ────────────────────────────────────────────

describe("validateCreateRoutineTemplate", () => {
  it("passes with valid input", () => {
    expect(
      validateCreateRoutineTemplate({
        name: "Morning meal",
        time: "08:00",
        type: "meal",
      }),
    ).toEqual([]);
  });

  it("fails with missing name", () => {
    const errors = validateCreateRoutineTemplate({
      name: "",
      time: "08:00",
      type: "meal",
    });
    expect(errors.some((e) => e.field === "name")).toBe(true);
  });

  it("fails with invalid time format", () => {
    const errors = validateCreateRoutineTemplate({
      name: "Walk",
      time: "8am",
      type: "walk",
    });
    expect(errors.some((e) => e.field === "time")).toBe(true);
  });

  it("fails with invalid type", () => {
    const errors = validateCreateRoutineTemplate({
      name: "Walk",
      time: "08:00",
      type: "invalid" as never,
    });
    expect(errors.some((e) => e.field === "type")).toBe(true);
  });
});

describe("validateUpdateRoutineTemplate", () => {
  it("passes with no fields", () => {
    expect(validateUpdateRoutineTemplate({})).toEqual([]);
  });

  it("fails with invalid time", () => {
    const errors = validateUpdateRoutineTemplate({ time: "25:00" });
    expect(errors).toHaveLength(1);
  });
});

// ── Activity Log ────────────────────────────────────────────────

describe("validateCreateActivityLog", () => {
  it("passes with valid type", () => {
    expect(validateCreateActivityLog({ type: "walk" })).toEqual([]);
  });

  it("passes with duration and note", () => {
    expect(
      validateCreateActivityLog({ type: "walk", duration: 30, note: "Park" }),
    ).toEqual([]);
  });

  it("fails with missing type", () => {
    const errors = validateCreateActivityLog({ type: "" as never });
    expect(errors.some((e) => e.field === "type")).toBe(true);
  });

  it("fails with negative duration", () => {
    const errors = validateCreateActivityLog({ type: "walk", duration: -5 });
    expect(errors.some((e) => e.field === "duration")).toBe(true);
  });

  it("fails with note exceeding max length", () => {
    const errors = validateCreateActivityLog({
      type: "walk",
      note: "a".repeat(1001),
    });
    expect(errors.some((e) => e.field === "note")).toBe(true);
  });
});

// ── Weight Entry ────────────────────────────────────────────────

describe("validateCreateWeightEntry", () => {
  it("passes with valid input", () => {
    expect(validateCreateWeightEntry({ weight: 5000, date: "2025-11-01" })).toEqual([]);
  });

  it("fails with zero weight", () => {
    const errors = validateCreateWeightEntry({ weight: 0, date: "2025-11-01" });
    expect(errors.some((e) => e.field === "weight")).toBe(true);
  });

  it("fails with missing date", () => {
    const errors = validateCreateWeightEntry({ weight: 5000, date: "" });
    expect(errors.some((e) => e.field === "date")).toBe(true);
  });
});

// ── Vet Visit ───────────────────────────────────────────────────

describe("validateCreateVetVisit", () => {
  it("passes with valid input", () => {
    expect(
      validateCreateVetVisit({ date: "2025-12-01", reason: "Checkup" }),
    ).toEqual([]);
  });

  it("fails with missing reason", () => {
    const errors = validateCreateVetVisit({ date: "2025-12-01", reason: "" });
    expect(errors.some((e) => e.field === "reason")).toBe(true);
  });

  it("fails with missing date", () => {
    const errors = validateCreateVetVisit({ date: "", reason: "Checkup" });
    expect(errors.some((e) => e.field === "date")).toBe(true);
  });
});

describe("validateUpdateVetVisit", () => {
  it("passes with no fields", () => {
    expect(validateUpdateVetVisit({})).toEqual([]);
  });
});

// ── Vaccination ─────────────────────────────────────────────────

describe("validateCreateVaccination", () => {
  it("passes with valid input", () => {
    expect(
      validateCreateVaccination({ name: "Rabies", date: "2025-11-01" }),
    ).toEqual([]);
  });

  it("fails with missing name", () => {
    const errors = validateCreateVaccination({ name: "", date: "2025-11-01" });
    expect(errors.some((e) => e.field === "name")).toBe(true);
  });
});

describe("validateUpdateVaccination", () => {
  it("passes with no fields", () => {
    expect(validateUpdateVaccination({})).toEqual([]);
  });
});

// ── Medication ──────────────────────────────────────────────────

describe("validateCreateMedication", () => {
  it("passes with valid input", () => {
    expect(
      validateCreateMedication({
        name: "Heartgard",
        dosage: "1 tablet",
        frequency: "once_daily",
        startDate: "2025-11-01",
      }),
    ).toEqual([]);
  });

  it("fails with missing name", () => {
    const errors = validateCreateMedication({
      name: "",
      dosage: "1 tablet",
      frequency: "once_daily",
      startDate: "2025-11-01",
    });
    expect(errors.some((e) => e.field === "name")).toBe(true);
  });

  it("fails with invalid frequency", () => {
    const errors = validateCreateMedication({
      name: "Med",
      dosage: "1 tablet",
      frequency: "invalid" as never,
      startDate: "2025-11-01",
    });
    expect(errors.some((e) => e.field === "frequency")).toBe(true);
  });
});

describe("validateUpdateMedication", () => {
  it("passes with no fields", () => {
    expect(validateUpdateMedication({})).toEqual([]);
  });
});

// ── Training Milestone ──────────────────────────────────────────

describe("validateCreateTrainingMilestone", () => {
  it("passes with valid input", () => {
    expect(validateCreateTrainingMilestone({ command: "Sit" })).toEqual([]);
  });

  it("passes with status", () => {
    expect(
      validateCreateTrainingMilestone({
        command: "Sit",
        status: "in_progress",
      }),
    ).toEqual([]);
  });

  it("fails with missing command", () => {
    const errors = validateCreateTrainingMilestone({ command: "" });
    expect(errors.some((e) => e.field === "command")).toBe(true);
  });

  it("fails with invalid status", () => {
    const errors = validateCreateTrainingMilestone({
      command: "Sit",
      status: "bad" as never,
    });
    expect(errors.some((e) => e.field === "status")).toBe(true);
  });
});

describe("validateUpdateTrainingMilestone", () => {
  it("passes with no fields", () => {
    expect(validateUpdateTrainingMilestone({})).toEqual([]);
  });

  it("fails with invalid status", () => {
    const errors = validateUpdateTrainingMilestone({
      status: "bad" as never,
    });
    expect(errors.some((e) => e.field === "status")).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { validateCreateHabit, isValidHabitFrequency } from "./validation.js";

describe("validateCreateHabit", () => {
  it("returns no errors for valid input", () => {
    const errors = validateCreateHabit({ name: "Exercise" });
    expect(errors).toEqual([]);
  });

  it("returns error for empty name", () => {
    const errors = validateCreateHabit({ name: "" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("returns error for invalid frequency", () => {
    const errors = validateCreateHabit({
      name: "Exercise",
      frequency: "invalid" as never,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("frequency");
  });
});

describe("isValidHabitFrequency", () => {
  it("returns true for valid frequencies", () => {
    expect(isValidHabitFrequency("daily")).toBe(true);
    expect(isValidHabitFrequency("weekly")).toBe(true);
    expect(isValidHabitFrequency("custom")).toBe(true);
  });

  it("returns false for invalid frequencies", () => {
    expect(isValidHabitFrequency("monthly")).toBe(false);
  });
});

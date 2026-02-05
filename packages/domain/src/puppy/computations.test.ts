import { describe, it, expect, vi, afterEach } from "vitest";
import {
  computePetAge,
  computeGrowthStage,
  computeTrainingProgress,
  computeTimeSince,
} from "./computations.ts";

describe("computePetAge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for null birthDate", () => {
    expect(computePetAge(null)).toBeNull();
  });

  it("computes months for a puppy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01"));
    expect(computePetAge("2025-11-01")).toBe("3 months");
    vi.useRealTimers();
  });

  it("computes years and months", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-03-15"));
    expect(computePetAge("2025-11-01")).toBe("1 year, 4 months");
    vi.useRealTimers();
  });

  it("computes weeks for very young puppy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-15"));
    expect(computePetAge("2025-11-01")).toBe("2 weeks");
    vi.useRealTimers();
  });

  it("computes days for newborn", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-03"));
    expect(computePetAge("2025-11-01")).toBe("2 days");
    vi.useRealTimers();
  });
});

describe("computeGrowthStage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns Unknown for null", () => {
    expect(computeGrowthStage(null)).toBe("Unknown");
  });

  it("returns Puppy for < 4 months", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-01"));
    expect(computeGrowthStage("2025-11-01")).toBe("Puppy");
    vi.useRealTimers();
  });

  it("returns Adolescent for 4-12 months", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01"));
    expect(computeGrowthStage("2025-11-01")).toBe("Adolescent");
    vi.useRealTimers();
  });

  it("returns Adult for > 12 months", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01"));
    expect(computeGrowthStage("2025-11-01")).toBe("Adult");
    vi.useRealTimers();
  });
});

describe("computeTrainingProgress", () => {
  it("returns zero for empty array", () => {
    expect(computeTrainingProgress([])).toEqual({
      learned: 0,
      total: 0,
      percentage: 0,
    });
  });

  it("computes correct progress", () => {
    const milestones = [
      { status: "learned" },
      { status: "in_progress" },
      { status: "not_started" },
      { status: "learned" },
    ];
    expect(computeTrainingProgress(milestones)).toEqual({
      learned: 2,
      total: 4,
      percentage: 50,
    });
  });
});

describe("computeTimeSince", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for null", () => {
    expect(computeTimeSince(null)).toBeNull();
  });

  it("returns just now", () => {
    vi.useFakeTimers();
    const now = new Date("2026-01-01T12:00:00Z");
    vi.setSystemTime(now);
    expect(computeTimeSince("2026-01-01T12:00:00Z")).toBe("just now");
    vi.useRealTimers();
  });

  it("returns minutes ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:30:00Z"));
    expect(computeTimeSince("2026-01-01T12:00:00Z")).toBe("30 minutes ago");
    vi.useRealTimers();
  });

  it("returns hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T15:00:00Z"));
    expect(computeTimeSince("2026-01-01T12:00:00Z")).toBe("3 hours ago");
    vi.useRealTimers();
  });

  it("returns days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));
    expect(computeTimeSince("2026-01-01T12:00:00Z")).toBe("2 days ago");
    vi.useRealTimers();
  });
});

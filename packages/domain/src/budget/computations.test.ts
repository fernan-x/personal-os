import { describe, it, expect } from "vitest";
import { computePlanSummary } from "./computations.ts";

describe("computePlanSummary", () => {
  const userA = "user-a";
  const userB = "user-b";

  it("computes personal income and expenses for a single user", () => {
    const result = computePlanSummary(
      [userA],
      [
        { userId: userA, amount: 300000 }, // 3000.00
      ],
      [
        { userId: userA, amount: 80000, scope: "personal", shares: [] },
        { userId: userA, amount: 50000, scope: "personal", shares: [] },
      ],
      [],
    );

    expect(result.totalIncome).toBe(300000);
    expect(result.totalExpenses).toBe(130000);
    expect(result.totalSavings).toBe(170000);
    expect(result.perUser).toHaveLength(1);
    expect(result.perUser[0].totalIncome).toBe(300000);
    expect(result.perUser[0].personalExpenses).toBe(130000);
    expect(result.perUser[0].commonExpenseShare).toBe(0);
    expect(result.perUser[0].savings).toBe(170000);
  });

  it("splits common expenses by basis points", () => {
    const result = computePlanSummary(
      [userA, userB],
      [
        { userId: userA, amount: 200000 },
        { userId: userB, amount: 150000 },
      ],
      [
        {
          userId: null,
          amount: 100000, // 1000.00 rent split 60/40
          scope: "common",
          shares: [
            { userId: userA, percentage: 6000 },
            { userId: userB, percentage: 4000 },
          ],
        },
      ],
      [],
    );

    const a = result.perUser.find((u) => u.userId === userA)!;
    const b = result.perUser.find((u) => u.userId === userB)!;

    expect(a.commonExpenseShare).toBe(60000); // 600.00
    expect(b.commonExpenseShare).toBe(40000); // 400.00
    expect(a.totalExpenses).toBe(60000);
    expect(b.totalExpenses).toBe(40000);
    expect(a.savings).toBe(140000);
    expect(b.savings).toBe(110000);
  });

  it("combines personal and common expenses", () => {
    const result = computePlanSummary(
      [userA, userB],
      [
        { userId: userA, amount: 300000 },
        { userId: userB, amount: 200000 },
      ],
      [
        { userId: userA, amount: 50000, scope: "personal", shares: [] },
        { userId: userB, amount: 30000, scope: "personal", shares: [] },
        {
          userId: null,
          amount: 80000,
          scope: "common",
          shares: [
            { userId: userA, percentage: 5000 },
            { userId: userB, percentage: 5000 },
          ],
        },
      ],
      [],
    );

    const a = result.perUser.find((u) => u.userId === userA)!;
    const b = result.perUser.find((u) => u.userId === userB)!;

    expect(a.personalExpenses).toBe(50000);
    expect(a.commonExpenseShare).toBe(40000);
    expect(a.totalExpenses).toBe(90000);
    expect(a.savings).toBe(210000);

    expect(b.personalExpenses).toBe(30000);
    expect(b.commonExpenseShare).toBe(40000);
    expect(b.totalExpenses).toBe(70000);
    expect(b.savings).toBe(130000);
  });

  it("computes envelope spent and allocated per user", () => {
    const result = computePlanSummary(
      [userA, userB],
      [],
      [],
      [
        {
          allocatedAmount: 50000,
          entries: [
            { userId: userA, amount: 15000 },
            { userId: userB, amount: 10000 },
            { userId: userA, amount: 5000 },
          ],
        },
        {
          allocatedAmount: 30000,
          entries: [{ userId: userB, amount: 8000 }],
        },
      ],
    );

    const a = result.perUser.find((u) => u.userId === userA)!;
    const b = result.perUser.find((u) => u.userId === userB)!;

    // envelopeAllocated is the total across all envelopes (same for all users)
    expect(a.envelopeAllocated).toBe(80000);
    expect(b.envelopeAllocated).toBe(80000);

    expect(a.envelopeSpent).toBe(20000);
    expect(b.envelopeSpent).toBe(18000);
  });

  it("handles empty data gracefully", () => {
    const result = computePlanSummary([userA], [], [], []);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalSavings).toBe(0);
    expect(result.perUser[0].savings).toBe(0);
  });

  it("rounds common expense share correctly", () => {
    // 1001 cents split into thirds (3333 + 3333 + 3334 basis points)
    const result = computePlanSummary(
      [userA, userB, "user-c"],
      [],
      [
        {
          userId: null,
          amount: 1001,
          scope: "common",
          shares: [
            { userId: userA, percentage: 3333 },
            { userId: userB, percentage: 3333 },
            { userId: "user-c", percentage: 3334 },
          ],
        },
      ],
      [],
    );

    const a = result.perUser.find((u) => u.userId === userA)!;
    const b = result.perUser.find((u) => u.userId === userB)!;
    const c = result.perUser.find((u) => u.userId === "user-c")!;

    // Math.round(1001 * 3333 / 10000) = Math.round(333.6333) = 334
    expect(a.commonExpenseShare).toBe(334);
    expect(b.commonExpenseShare).toBe(334);
    // Math.round(1001 * 3334 / 10000) = Math.round(333.7334) = 334
    expect(c.commonExpenseShare).toBe(334);
  });
});

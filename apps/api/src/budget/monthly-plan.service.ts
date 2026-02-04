import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateMonthlyPlan, computePlanSummary } from "@personal-os/domain";
import type { CreateMonthlyPlanInput } from "@personal-os/domain";

@Injectable()
export class MonthlyPlanService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(groupId: string) {
    return this.db.monthlyPlan.findMany({
      where: { groupId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }

  async findOne(planId: string, groupId: string) {
    const plan = await this.db.monthlyPlan.findUnique({
      where: { id: planId },
      include: {
        incomes: { include: { user: { select: { id: true, email: true, name: true } } } },
        expenses: {
          include: {
            user: { select: { id: true, email: true, name: true } },
            category: true,
            shares: { include: { user: { select: { id: true, email: true, name: true } } } },
          },
        },
        envelopes: {
          include: {
            category: true,
            entries: { include: { user: { select: { id: true, email: true, name: true } } } },
          },
        },
      },
    });

    if (!plan || plan.groupId !== groupId) {
      throw new NotFoundException("Monthly plan not found");
    }

    return plan;
  }

  async create(groupId: string, input: CreateMonthlyPlanInput) {
    const errors = validateCreateMonthlyPlan(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const existing = await this.db.monthlyPlan.findUnique({
      where: { groupId_month_year: { groupId, month: input.month, year: input.year } },
    });

    if (existing) {
      throw new ConflictException(
        `A plan for ${input.month}/${input.year} already exists`,
      );
    }

    const plan = await this.db.monthlyPlan.create({
      data: { groupId, month: input.month, year: input.year },
    });

    if (input.prefillFromPrevious) {
      await this.prefillFromPrevious(plan.id, groupId, input.month, input.year);
    }

    return this.findOne(plan.id, groupId);
  }

  async getSummary(planId: string, groupId: string) {
    const plan = await this.db.monthlyPlan.findUnique({
      where: { id: planId },
      include: {
        group: { include: { members: true } },
        incomes: true,
        expenses: { include: { shares: true } },
        envelopes: { include: { entries: true } },
      },
    });

    if (!plan || plan.groupId !== groupId) {
      throw new NotFoundException("Monthly plan not found");
    }

    const memberIds = plan.group.members.map((m) => m.userId);

    return computePlanSummary(
      memberIds,
      plan.incomes.map((i) => ({ userId: i.userId, amount: i.amount })),
      plan.expenses.map((e) => ({
        userId: e.userId,
        amount: e.amount,
        scope: e.scope,
        shares: e.shares.map((s) => ({ userId: s.userId, percentage: s.percentage })),
      })),
      plan.envelopes.map((env) => ({
        allocatedAmount: env.allocatedAmount,
        entries: env.entries.map((e) => ({ userId: e.userId, amount: e.amount })),
      })),
    );
  }

  private async prefillFromPrevious(
    newPlanId: string,
    groupId: string,
    month: number,
    year: number,
  ) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const previousPlan = await this.db.monthlyPlan.findUnique({
      where: { groupId_month_year: { groupId, month: prevMonth, year: prevYear } },
      include: {
        incomes: true,
        expenses: { where: { recurrence: "recurring" }, include: { shares: true } },
        envelopes: true,
      },
    });

    if (!previousPlan) return;

    // Copy incomes
    for (const income of previousPlan.incomes) {
      await this.db.income.create({
        data: {
          monthlyPlanId: newPlanId,
          userId: income.userId,
          source: income.source,
          amount: income.amount,
        },
      });
    }

    // Copy recurring expenses (reset status to pending)
    for (const expense of previousPlan.expenses) {
      const newExpense = await this.db.plannedExpense.create({
        data: {
          monthlyPlanId: newPlanId,
          userId: expense.userId,
          name: expense.name,
          amount: expense.amount,
          scope: expense.scope,
          recurrence: expense.recurrence,
          status: "pending",
          categoryId: expense.categoryId,
        },
      });

      // Copy shares for common expenses
      for (const share of expense.shares) {
        await this.db.expenseShare.create({
          data: {
            plannedExpenseId: newExpense.id,
            userId: share.userId,
            percentage: share.percentage,
          },
        });
      }
    }

    // Copy envelope allocations (no entries)
    for (const envelope of previousPlan.envelopes) {
      await this.db.envelope.create({
        data: {
          monthlyPlanId: newPlanId,
          categoryId: envelope.categoryId,
          allocatedAmount: envelope.allocatedAmount,
        },
      });
    }
  }
}

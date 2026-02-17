import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreatePlannedExpense,
  validateUpdatePlannedExpense,
  validateUpdateExpenseStatus,
  validateCreateSharedExpense,
} from "@personal-os/domain";
import type {
  CreatePlannedExpenseInput,
  UpdatePlannedExpenseInput,
  UpdateExpenseStatusInput,
  CreateSharedExpenseInput,
} from "@personal-os/domain";

const EXPENSE_INCLUDE = {
  user: { select: { id: true, email: true, name: true } },
  category: true,
  shares: {
    include: { user: { select: { id: true, email: true, name: true } } },
  },
} as const;

@Injectable()
export class PlannedExpenseService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(planId: string) {
    return this.db.plannedExpense.findMany({
      where: { monthlyPlanId: planId },
      include: EXPENSE_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    planId: string,
    userId: string,
    input: CreatePlannedExpenseInput,
  ) {
    const errors = validateCreatePlannedExpense(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    await this.ensurePlanExists(planId);

    const expense = await this.db.plannedExpense.create({
      data: {
        monthlyPlanId: planId,
        userId,
        name: input.name.trim(),
        amount: input.amount,
        scope: input.scope ?? "personal",
        recurrence: input.recurrence ?? "recurring",
        categoryId: input.categoryId,
      },
      include: EXPENSE_INCLUDE,
    });

    if (input.categoryId) {
      await this.autoCreateEnvelopeIfNeeded(planId, input.categoryId);
    }

    return expense;
  }

  async update(id: string, input: UpdatePlannedExpenseInput) {
    const errors = validateUpdatePlannedExpense(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const expense = await this.db.plannedExpense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException("Planned expense not found");
    }

    return this.db.plannedExpense.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.scope !== undefined && { scope: input.scope }),
        ...(input.recurrence !== undefined && { recurrence: input.recurrence }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      },
      include: EXPENSE_INCLUDE,
    });
  }

  async updateStatus(id: string, input: UpdateExpenseStatusInput) {
    const errors = validateUpdateExpenseStatus(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const expense = await this.db.plannedExpense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException("Planned expense not found");
    }

    return this.db.plannedExpense.update({
      where: { id },
      data: { status: input.status },
      include: EXPENSE_INCLUDE,
    });
  }

  async remove(id: string) {
    const expense = await this.db.plannedExpense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException("Planned expense not found");
    }

    await this.db.plannedExpense.delete({ where: { id } });
    return { deleted: true };
  }

  async createShared(planId: string, input: CreateSharedExpenseInput) {
    const errors = validateCreateSharedExpense(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    await this.ensurePlanExists(planId);

    return this.db.plannedExpense.create({
      data: {
        monthlyPlanId: planId,
        name: input.name.trim(),
        amount: input.amount,
        scope: "common",
        recurrence: "exceptional",
        categoryId: input.categoryId,
        shares: {
          create: input.shares.map((s) => ({
            userId: s.userId,
            percentage: s.percentage,
          })),
        },
      },
      include: EXPENSE_INCLUDE,
    });
  }

  private async autoCreateEnvelopeIfNeeded(planId: string, categoryId: string) {
    const category = await this.db.expenseCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category?.autoCreateEnvelope) return;

    const existing = await this.db.envelope.findUnique({
      where: { monthlyPlanId_categoryId: { monthlyPlanId: planId, categoryId } },
    });
    if (existing) return;

    const expenses = await this.db.plannedExpense.findMany({
      where: { monthlyPlanId: planId, categoryId },
    });
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    await this.db.envelope.create({
      data: {
        monthlyPlanId: planId,
        categoryId,
        allocatedAmount: totalAmount,
      },
    });
  }

  private async ensurePlanExists(planId: string) {
    const plan = await this.db.monthlyPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException("Monthly plan not found");
    }
  }
}

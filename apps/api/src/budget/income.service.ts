import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateIncome, validateUpdateIncome } from "@personal-os/domain";
import type { CreateIncomeInput, UpdateIncomeInput } from "@personal-os/domain";

@Injectable()
export class IncomeService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(planId: string) {
    return this.db.income.findMany({
      where: { monthlyPlanId: planId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(planId: string, userId: string, input: CreateIncomeInput) {
    const errors = validateCreateIncome(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    await this.ensurePlanExists(planId);

    return this.db.income.create({
      data: {
        monthlyPlanId: planId,
        userId,
        source: input.source.trim(),
        amount: input.amount,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async update(id: string, userId: string, input: UpdateIncomeInput) {
    const errors = validateUpdateIncome(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const income = await this.db.income.findUnique({ where: { id } });
    if (!income) {
      throw new NotFoundException("Income not found");
    }
    if (income.userId !== userId) {
      throw new ForbiddenException("You can only edit your own incomes");
    }

    return this.db.income.update({
      where: { id },
      data: {
        ...(input.source !== undefined && { source: input.source.trim() }),
        ...(input.amount !== undefined && { amount: input.amount }),
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const income = await this.db.income.findUnique({ where: { id } });
    if (!income) {
      throw new NotFoundException("Income not found");
    }
    if (income.userId !== userId) {
      throw new ForbiddenException("You can only delete your own incomes");
    }

    await this.db.income.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensurePlanExists(planId: string) {
    const plan = await this.db.monthlyPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException("Monthly plan not found");
    }
  }
}

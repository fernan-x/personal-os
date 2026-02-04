import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateEnvelope, validateUpdateEnvelope } from "@personal-os/domain";
import type { CreateEnvelopeInput, UpdateEnvelopeInput } from "@personal-os/domain";

@Injectable()
export class EnvelopeService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(planId: string) {
    const envelopes = await this.db.envelope.findMany({
      where: { monthlyPlanId: planId },
      include: {
        category: true,
        entries: {
          include: { user: { select: { id: true, email: true, name: true } } },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { category: { name: "asc" } },
    });

    return envelopes.map((env) => ({
      ...env,
      spent: env.entries.reduce((sum, e) => sum + e.amount, 0),
      remaining: env.allocatedAmount - env.entries.reduce((sum, e) => sum + e.amount, 0),
    }));
  }

  async create(planId: string, input: CreateEnvelopeInput) {
    const errors = validateCreateEnvelope(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    await this.ensurePlanExists(planId);

    const existing = await this.db.envelope.findUnique({
      where: { monthlyPlanId_categoryId: { monthlyPlanId: planId, categoryId: input.categoryId } },
    });

    if (existing) {
      throw new ConflictException("An envelope for this category already exists in this plan");
    }

    return this.db.envelope.create({
      data: {
        monthlyPlanId: planId,
        categoryId: input.categoryId,
        allocatedAmount: input.allocatedAmount,
      },
      include: { category: true },
    });
  }

  async update(id: string, input: UpdateEnvelopeInput) {
    const errors = validateUpdateEnvelope(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const envelope = await this.db.envelope.findUnique({ where: { id } });
    if (!envelope) {
      throw new NotFoundException("Envelope not found");
    }

    return this.db.envelope.update({
      where: { id },
      data: {
        ...(input.allocatedAmount !== undefined && { allocatedAmount: input.allocatedAmount }),
      },
      include: { category: true },
    });
  }

  async remove(id: string) {
    const envelope = await this.db.envelope.findUnique({ where: { id } });
    if (!envelope) {
      throw new NotFoundException("Envelope not found");
    }

    await this.db.envelope.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensurePlanExists(planId: string) {
    const plan = await this.db.monthlyPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException("Monthly plan not found");
    }
  }
}

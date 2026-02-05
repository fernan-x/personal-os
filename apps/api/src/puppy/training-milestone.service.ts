import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateTrainingMilestone,
  validateUpdateTrainingMilestone,
} from "@personal-os/domain";
import type {
  CreateTrainingMilestoneInput,
  UpdateTrainingMilestoneInput,
} from "@personal-os/domain";

@Injectable()
export class TrainingMilestoneService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(petId: string) {
    return this.db.trainingMilestone.findMany({
      where: { petId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(petId: string, input: CreateTrainingMilestoneInput) {
    const errors = validateCreateTrainingMilestone(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    return this.db.trainingMilestone.create({
      data: {
        petId,
        command: input.command.trim(),
        status: input.status ?? "not_started",
        dateAchieved: input.status === "learned" ? new Date() : null,
        notes: input.notes?.trim() || null,
      },
    });
  }

  async update(id: string, input: UpdateTrainingMilestoneInput) {
    const errors = validateUpdateTrainingMilestone(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    const milestone = await this.db.trainingMilestone.findUnique({
      where: { id },
    });
    if (!milestone) throw new NotFoundException("Training milestone not found");

    // Auto-set dateAchieved when status changes to "learned"
    const dateAchieved =
      input.status === "learned" && milestone.status !== "learned"
        ? new Date()
        : input.status && input.status !== "learned"
          ? null
          : undefined;

    return this.db.trainingMilestone.update({
      where: { id },
      data: {
        ...(input.command !== undefined && { command: input.command.trim() }),
        ...(input.status !== undefined && { status: input.status }),
        ...(dateAchieved !== undefined && { dateAchieved }),
        ...(input.notes !== undefined && {
          notes: input.notes?.trim() || null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.db.trainingMilestone.delete({ where: { id } });
    return { deleted: true };
  }
}

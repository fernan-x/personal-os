import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateRoutineTemplate,
  validateUpdateRoutineTemplate,
} from "@personal-os/domain";
import type {
  CreateRoutineTemplateInput,
  UpdateRoutineTemplateInput,
} from "@personal-os/domain";

@Injectable()
export class RoutineTemplateService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(petId: string) {
    return this.db.routineTemplate.findMany({
      where: { petId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async findOne(id: string) {
    const template = await this.db.routineTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException("Routine template not found");
    }

    return template;
  }

  async create(petId: string, input: CreateRoutineTemplateInput) {
    const errors = validateCreateRoutineTemplate(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const maxSort = await this.db.routineTemplate.aggregate({
      where: { petId },
      _max: { sortOrder: true },
    });

    return this.db.routineTemplate.create({
      data: {
        petId,
        name: input.name.trim(),
        time: input.time,
        type: input.type,
        sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async update(id: string, input: UpdateRoutineTemplateInput) {
    const errors = validateUpdateRoutineTemplate(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.routineTemplate.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.time !== undefined && { time: input.time }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.db.routineTemplate.delete({ where: { id } });
    return { deleted: true };
  }

  async reorder(petId: string, templateIds: string[]) {
    await this.db.$transaction(
      templateIds.map((id, index) =>
        this.db.routineTemplate.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.findAll(petId);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateVetVisit,
  validateUpdateVetVisit,
} from "@personal-os/domain";
import type {
  CreateVetVisitInput,
  UpdateVetVisitInput,
} from "@personal-os/domain";

@Injectable()
export class VetVisitService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(petId: string) {
    return this.db.vetVisit.findMany({
      where: { petId },
      orderBy: { date: "desc" },
    });
  }

  async create(petId: string, input: CreateVetVisitInput) {
    const errors = validateCreateVetVisit(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    return this.db.vetVisit.create({
      data: {
        petId,
        date: new Date(input.date),
        reason: input.reason.trim(),
        notes: input.notes?.trim() || null,
        nextVisitDate: input.nextVisitDate
          ? new Date(input.nextVisitDate)
          : null,
      },
    });
  }

  async update(id: string, input: UpdateVetVisitInput) {
    const errors = validateUpdateVetVisit(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    const visit = await this.db.vetVisit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException("Vet visit not found");

    return this.db.vetVisit.update({
      where: { id },
      data: {
        ...(input.date !== undefined && { date: new Date(input.date) }),
        ...(input.reason !== undefined && { reason: input.reason.trim() }),
        ...(input.notes !== undefined && {
          notes: input.notes?.trim() || null,
        }),
        ...(input.nextVisitDate !== undefined && {
          nextVisitDate: input.nextVisitDate
            ? new Date(input.nextVisitDate)
            : null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.db.vetVisit.delete({ where: { id } });
    return { deleted: true };
  }
}

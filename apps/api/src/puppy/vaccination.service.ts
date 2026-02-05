import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateVaccination,
  validateUpdateVaccination,
} from "@personal-os/domain";
import type {
  CreateVaccinationInput,
  UpdateVaccinationInput,
} from "@personal-os/domain";

@Injectable()
export class VaccinationService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(petId: string) {
    return this.db.vaccination.findMany({
      where: { petId },
      orderBy: { date: "desc" },
    });
  }

  async create(petId: string, input: CreateVaccinationInput) {
    const errors = validateCreateVaccination(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    return this.db.vaccination.create({
      data: {
        petId,
        name: input.name.trim(),
        date: new Date(input.date),
        nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : null,
      },
    });
  }

  async update(id: string, input: UpdateVaccinationInput) {
    const errors = validateUpdateVaccination(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    const vax = await this.db.vaccination.findUnique({ where: { id } });
    if (!vax) throw new NotFoundException("Vaccination not found");

    return this.db.vaccination.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.date !== undefined && { date: new Date(input.date) }),
        ...(input.nextDueDate !== undefined && {
          nextDueDate: input.nextDueDate
            ? new Date(input.nextDueDate)
            : null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.db.vaccination.delete({ where: { id } });
    return { deleted: true };
  }
}

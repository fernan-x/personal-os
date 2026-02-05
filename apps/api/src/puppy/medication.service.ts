import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateMedication,
  validateUpdateMedication,
} from "@personal-os/domain";
import type {
  CreateMedicationInput,
  UpdateMedicationInput,
} from "@personal-os/domain";

@Injectable()
export class MedicationService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(petId: string) {
    return this.db.medication.findMany({
      where: { petId },
      orderBy: { startDate: "desc" },
    });
  }

  async create(petId: string, input: CreateMedicationInput) {
    const errors = validateCreateMedication(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    return this.db.medication.create({
      data: {
        petId,
        name: input.name.trim(),
        dosage: input.dosage.trim(),
        frequency: input.frequency,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        notes: input.notes?.trim() || null,
      },
    });
  }

  async update(id: string, input: UpdateMedicationInput) {
    const errors = validateUpdateMedication(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    const med = await this.db.medication.findUnique({ where: { id } });
    if (!med) throw new NotFoundException("Medication not found");

    return this.db.medication.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.dosage !== undefined && { dosage: input.dosage.trim() }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        ...(input.startDate !== undefined && {
          startDate: new Date(input.startDate),
        }),
        ...(input.endDate !== undefined && {
          endDate: input.endDate ? new Date(input.endDate) : null,
        }),
        ...(input.notes !== undefined && {
          notes: input.notes?.trim() || null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.db.medication.delete({ where: { id } });
    return { deleted: true };
  }
}

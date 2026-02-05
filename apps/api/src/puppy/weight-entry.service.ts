import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateWeightEntry } from "@personal-os/domain";
import type { CreateWeightEntryInput } from "@personal-os/domain";

@Injectable()
export class WeightEntryService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(petId: string) {
    return this.db.weightEntry.findMany({
      where: { petId },
      orderBy: { date: "asc" },
    });
  }

  async create(petId: string, input: CreateWeightEntryInput) {
    const errors = validateCreateWeightEntry(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const dateOnly = new Date(input.date);

    return this.db.weightEntry.upsert({
      where: { petId_date: { petId, date: dateOnly } },
      create: {
        petId,
        weight: input.weight,
        date: dateOnly,
      },
      update: {
        weight: input.weight,
      },
    });
  }

  async remove(id: string) {
    const entry = await this.db.weightEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException("Weight entry not found");
    }
    await this.db.weightEntry.delete({ where: { id } });
    return { deleted: true };
  }
}

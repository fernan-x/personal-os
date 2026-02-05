import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreatePet, validateUpdatePet } from "@personal-os/domain";
import type { CreatePetInput, UpdatePetInput } from "@personal-os/domain";

@Injectable()
export class PetService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(householdId: string) {
    return this.db.pet.findMany({
      where: { householdId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(petId: string) {
    const pet = await this.db.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    return pet;
  }

  async create(householdId: string, input: CreatePetInput) {
    const errors = validateCreatePet(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.pet.create({
      data: {
        householdId,
        name: input.name.trim(),
        breed: input.breed?.trim() || null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        photoUrl: input.photoUrl || null,
      },
    });
  }

  async update(petId: string, input: UpdatePetInput) {
    const errors = validateUpdatePet(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.pet.update({
      where: { id: petId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.breed !== undefined && {
          breed: input.breed?.trim() || null,
        }),
        ...(input.birthDate !== undefined && {
          birthDate: input.birthDate ? new Date(input.birthDate) : null,
        }),
        ...(input.photoUrl !== undefined && {
          photoUrl: input.photoUrl || null,
        }),
      },
    });
  }

  async remove(petId: string) {
    await this.db.pet.delete({ where: { id: petId } });
    return { deleted: true };
  }
}

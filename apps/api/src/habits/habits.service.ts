import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateHabit } from "@personal-os/domain";
import type { CreateHabitInput } from "@personal-os/domain";

@Injectable()
export class HabitsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.habit.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const habit = await this.db.habit.findUnique({
      where: { id },
      include: { entries: { orderBy: { date: "desc" }, take: 30 } },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${id}" not found`);
    }

    return habit;
  }

  async create(input: CreateHabitInput) {
    const errors = validateCreateHabit(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.habit.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim(),
        frequency: input.frequency ?? "daily",
      },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateHabit, validateUpdateHabit } from "@personal-os/domain";
import type { CreateHabitInput, UpdateHabitInput, LogHabitEntryInput } from "@personal-os/domain";

@Injectable()
export class HabitsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return this.db.habit.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { entries: { where: { date: today }, take: 1 } },
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

  async update(id: string, input: UpdateHabitInput) {
    const errors = validateUpdateHabit(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const habit = await this.db.habit.findUnique({ where: { id } });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${id}" not found`);
    }

    return this.db.habit.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && {
          description: input.description?.trim() ?? null,
        }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  async logEntry(habitId: string, input: Pick<LogHabitEntryInput, "date" | "completed" | "note">) {
    const habit = await this.db.habit.findUnique({ where: { id: habitId } });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${habitId}" not found`);
    }

    const date = new Date(input.date);
    date.setUTCHours(0, 0, 0, 0);

    return this.db.habitEntry.upsert({
      where: { habitId_date: { habitId, date } },
      create: {
        habitId,
        date,
        completed: input.completed,
        note: input.note?.trim(),
      },
      update: {
        completed: input.completed,
        note: input.note?.trim(),
      },
    });
  }
}

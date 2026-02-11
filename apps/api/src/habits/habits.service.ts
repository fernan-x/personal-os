import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateHabit, validateUpdateHabit } from "@personal-os/domain";
import type {
  CreateHabitInput,
  UpdateHabitInput,
  LogHabitEntryInput,
} from "@personal-os/domain";

/** Return Monday 00:00 UTC of the ISO week containing `date`. */
function getIsoWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

/** Return Sunday 00:00 UTC of the ISO week containing `date`. */
function getIsoWeekEnd(date: Date): Date {
  const start = getIsoWeekStart(date);
  start.setUTCDate(start.getUTCDate() + 6);
  return start;
}

@Injectable()
export class HabitsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId: string, date?: string) {
    const target = date ? new Date(date + "T00:00:00.000Z") : new Date();
    target.setUTCHours(0, 0, 0, 0);

    const habits = await this.db.habit.findMany({
      where: { isActive: true, userId },
      orderBy: { createdAt: "desc" },
    });

    if (habits.length === 0) return [];

    // Daily & custom: fetch entry for the exact date
    const dailyIds = habits
      .filter((h) => h.frequency !== "weekly")
      .map((h) => h.id);

    // Weekly: fetch any completed entry in the same ISO week
    const weeklyIds = habits
      .filter((h) => h.frequency === "weekly")
      .map((h) => h.id);

    const weekStart = getIsoWeekStart(target);
    const weekEnd = getIsoWeekEnd(target);

    const [dailyEntries, weeklyEntries] = await Promise.all([
      dailyIds.length > 0
        ? this.db.habitEntry.findMany({
            where: {
              habitId: { in: dailyIds },
              date: target,
            },
          })
        : Promise.resolve([]),
      weeklyIds.length > 0
        ? this.db.habitEntry.findMany({
            where: {
              habitId: { in: weeklyIds },
              date: { gte: weekStart, lte: weekEnd },
              completed: true,
            },
          })
        : Promise.resolve([]),
    ]);

    // Build a map habitId → entries for the response
    const entryMap = new Map<string, typeof dailyEntries>();
    for (const entry of dailyEntries) {
      entryMap.set(entry.habitId, [entry]);
    }
    // For weekly, pick the first completed entry (to show in the card)
    for (const entry of weeklyEntries) {
      if (!entryMap.has(entry.habitId)) {
        entryMap.set(entry.habitId, [entry]);
      }
    }

    return habits.map((h) => ({
      ...h,
      entries: entryMap.get(h.id) ?? [],
    }));
  }

  async getSummary(userId: string, from: string, to: string) {
    const fromDate = new Date(from + "T00:00:00.000Z");
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(to + "T00:00:00.000Z");
    toDate.setUTCHours(0, 0, 0, 0);

    const habits = await this.db.habit.findMany({
      where: { isActive: true, userId },
      select: { id: true, frequency: true, customDays: true },
    });

    if (habits.length === 0) return [];

    const dailyHabits = habits.filter((h) => h.frequency === "daily");
    const customHabits = habits.filter((h) => h.frequency === "custom");
    const weeklyHabits = habits.filter((h) => h.frequency === "weekly");

    // Expand date range for weekly habits: we need the full ISO weeks
    // that overlap with [fromDate, toDate]
    const expandedFrom = weeklyHabits.length > 0
      ? getIsoWeekStart(fromDate)
      : fromDate;
    const expandedTo = weeklyHabits.length > 0
      ? getIsoWeekEnd(toDate)
      : toDate;

    const allIds = habits.map((h) => h.id);

    const entries = await this.db.habitEntry.findMany({
      where: {
        habitId: { in: allIds },
        date: { gte: expandedFrom, lte: expandedTo },
        completed: true,
      },
      select: { habitId: true, date: true },
    });

    // Daily completed: date → set of habitIds
    const dailyCompleted = new Map<string, Set<string>>();
    // Weekly completed: "YYYY-Www" → set of habitIds
    const weeklyCompleted = new Map<string, Set<string>>();

    const dailyIdSet = new Set([
      ...dailyHabits.map((h) => h.id),
      ...customHabits.map((h) => h.id),
    ]);
    const weeklyIdSet = new Set(weeklyHabits.map((h) => h.id));

    for (const entry of entries) {
      const dateKey = entry.date.toISOString().split("T")[0];
      if (dailyIdSet.has(entry.habitId)) {
        if (!dailyCompleted.has(dateKey)) {
          dailyCompleted.set(dateKey, new Set());
        }
        dailyCompleted.get(dateKey)!.add(entry.habitId);
      }
      if (weeklyIdSet.has(entry.habitId)) {
        const weekKey = getIsoWeekStart(entry.date).toISOString().split("T")[0];
        if (!weeklyCompleted.has(weekKey)) {
          weeklyCompleted.set(weekKey, new Set());
        }
        weeklyCompleted.get(weekKey)!.add(entry.habitId);
      }
    }

    const nonCustomCount = dailyHabits.length + weeklyHabits.length;
    const result: { date: string; completed: number; total: number }[] = [];
    const current = new Date(fromDate);

    while (current <= toDate) {
      const dateKey = current.toISOString().split("T")[0];
      const weekKey = getIsoWeekStart(current).toISOString().split("T")[0];
      // ISO weekday: 1=Mon … 7=Sun
      const jsDay = current.getUTCDay(); // 0=Sun … 6=Sat
      const isoDay = jsDay === 0 ? 7 : jsDay;

      const activeCustomCount = customHabits.filter((h) =>
        h.customDays.includes(isoDay),
      ).length;

      const dailyDone = dailyCompleted.get(dateKey)?.size ?? 0;
      const weeklyDone = weeklyCompleted.get(weekKey)?.size ?? 0;

      result.push({
        date: dateKey,
        completed: dailyDone + weeklyDone,
        total: nonCustomCount + activeCustomCount,
      });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return result;
  }

  async findOne(id: string, userId: string) {
    const habit = await this.db.habit.findUnique({
      where: { id },
      include: { entries: { orderBy: { date: "desc" }, take: 30 } },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${id}" not found`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException("You do not have access to this habit");
    }

    return habit;
  }

  async create(input: CreateHabitInput, userId: string) {
    const errors = validateCreateHabit(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.habit.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim(),
        frequency: input.frequency ?? "daily",
        customDays: input.frequency === "custom" ? input.customDays ?? [] : [],
        userId,
      },
    });
  }

  async update(id: string, input: UpdateHabitInput, userId: string) {
    const errors = validateUpdateHabit(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const habit = await this.db.habit.findUnique({ where: { id } });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${id}" not found`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException("You do not have access to this habit");
    }

    return this.db.habit.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && {
          description: input.description?.trim() ?? null,
        }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        ...(input.customDays !== undefined && { customDays: input.customDays }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const habit = await this.db.habit.findUnique({ where: { id } });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${id}" not found`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException("You do not have access to this habit");
    }

    await this.db.habit.delete({ where: { id } });

    return { deleted: true };
  }

  async logEntry(
    habitId: string,
    input: Pick<LogHabitEntryInput, "date" | "completed" | "note">,
    userId: string,
  ) {
    const habit = await this.db.habit.findUnique({ where: { id: habitId } });

    if (!habit) {
      throw new NotFoundException(`Habit with id "${habitId}" not found`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException("You do not have access to this habit");
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

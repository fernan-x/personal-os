import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class DailyChecklistService {
  constructor(private readonly db: DatabaseService) {}

  async getOrGenerateForDate(petId: string, date: Date) {
    const dateOnly = new Date(date.toISOString().split("T")[0]);

    const templates = await this.db.routineTemplate.findMany({
      where: { petId },
      orderBy: { sortOrder: "asc" },
    });

    if (templates.length === 0) {
      return [];
    }

    // Lazy generation: create checklist items for templates that don't have one yet
    for (const template of templates) {
      await this.db.dailyChecklistItem.upsert({
        where: {
          templateId_date: { templateId: template.id, date: dateOnly },
        },
        create: {
          petId,
          templateId: template.id,
          date: dateOnly,
        },
        update: {},
      });
    }

    return this.db.dailyChecklistItem.findMany({
      where: { petId, date: dateOnly },
      include: {
        template: true,
        completedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { template: { sortOrder: "asc" } },
    });
  }

  async toggleItem(itemId: string, userId: string) {
    const item = await this.db.dailyChecklistItem.findUnique({
      where: { id: itemId },
      include: { template: true },
    });

    if (!item) {
      throw new NotFoundException("Checklist item not found");
    }

    // If already completed, uncheck it
    if (item.completed) {
      return this.db.dailyChecklistItem.update({
        where: { id: itemId },
        data: {
          completed: false,
          completedById: null,
          completedAt: null,
        },
        include: {
          template: true,
          completedBy: { select: { id: true, email: true, name: true } },
        },
      });
    }

    // Check: warn if same item was completed within 5 minutes by another user
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCompletion = await this.db.dailyChecklistItem.findFirst({
      where: {
        id: itemId,
        completed: true,
        completedAt: { gte: fiveMinAgo },
        completedById: { not: userId },
      },
    });

    // Mark as completed
    const updated = await this.db.dailyChecklistItem.update({
      where: { id: itemId },
      data: {
        completed: true,
        completedById: userId,
        completedAt: new Date(),
      },
      include: {
        template: true,
        completedBy: { select: { id: true, email: true, name: true } },
      },
    });

    return {
      ...updated,
      duplicateWarning: recentCompletion
        ? "This item was recently completed by another member"
        : undefined,
    };
  }

  async getTodayForHousehold(householdId: string) {
    const today = new Date(new Date().toISOString().split("T")[0]);

    const pets = await this.db.pet.findMany({
      where: { householdId },
      orderBy: { createdAt: "asc" },
    });

    const result = [];
    for (const pet of pets) {
      const items = await this.getOrGenerateForDate(pet.id, today);
      result.push({ pet, items });
    }

    return result;
  }
}

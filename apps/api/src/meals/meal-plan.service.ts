import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { UploadService } from "../upload/upload.service";
import {
  validateCreateMealPlan,
  validateUpdateMealPlan,
  validateCreateMealPlanEntry,
  validateUpdateMealPlanEntry,
  validateGenerateMealPlan,
  aggregateIngredients,
} from "@personal-os/domain";
import type {
  CreateMealPlanInput,
  UpdateMealPlanInput,
  CreateMealPlanEntryInput,
  UpdateMealPlanEntryInput,
  GenerateMealPlanInput,
} from "@personal-os/domain";
import { MealPlanGeneratorService } from "./meal-plan-generator.service";

@Injectable()
export class MealPlanService {
  constructor(
    private readonly db: DatabaseService,
    private readonly uploadService: UploadService,
    private readonly generatorService: MealPlanGeneratorService,
  ) {}

  async findAll(userId: string) {
    return this.db.mealPlan.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      include: { _count: { select: { entries: true } } },
    });
  }

  async generate(input: GenerateMealPlanInput, userId: string) {
    const errors = validateGenerateMealPlan(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const { planId, warnings } = await this.generatorService.generate(
      input,
      userId,
    );
    const plan = await this.findOne(planId, userId);
    return { ...plan, warnings };
  }

  async findOne(id: string, userId: string) {
    const plan = await this.db.mealPlan.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            recipe: {
              include: {
                ingredients: { orderBy: { sortOrder: "asc" } },
                tags: { include: { tag: true } },
              },
            },
          },
          orderBy: [{ date: "asc" }, { slot: "asc" }],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Meal plan with id "${id}" not found`);
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException("You do not have access to this meal plan");
    }

    // Resolve photo URLs for all entry recipes
    const entries = await Promise.all(
      plan.entries.map(async (entry) => ({
        ...entry,
        recipe: await this.uploadService.resolvePhotoUrl(entry.recipe),
      })),
    );

    return { ...plan, entries };
  }

  async create(input: CreateMealPlanInput, userId: string) {
    const errors = validateCreateMealPlan(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.mealPlan.create({
      data: {
        userId,
        name: input.name.trim(),
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      },
      include: { _count: { select: { entries: true } } },
    });
  }

  async update(id: string, input: UpdateMealPlanInput, userId: string) {
    const errors = validateUpdateMealPlan(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const plan = await this.db.mealPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Meal plan with id "${id}" not found`);
    }
    if (plan.userId !== userId) {
      throw new ForbiddenException("You can only edit your own meal plans");
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.startDate !== undefined)
      data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) data.endDate = new Date(input.endDate);

    return this.db.mealPlan.update({
      where: { id },
      data,
      include: { _count: { select: { entries: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const plan = await this.db.mealPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Meal plan with id "${id}" not found`);
    }
    if (plan.userId !== userId) {
      throw new ForbiddenException("You can only delete your own meal plans");
    }

    await this.db.mealPlan.delete({ where: { id } });
    return { deleted: true };
  }

  async createEntry(
    planId: string,
    input: CreateMealPlanEntryInput,
    userId: string,
  ) {
    const errors = validateCreateMealPlanEntry(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    // Check plan ownership
    const plan = await this.db.mealPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(`Meal plan with id "${planId}" not found`);
    }
    if (plan.userId !== userId) {
      throw new ForbiddenException("You do not have access to this meal plan");
    }

    // Check recipe is accessible (public or own)
    const recipe = await this.db.recipe.findUnique({
      where: { id: input.recipeId },
    });
    if (!recipe) {
      throw new NotFoundException(
        `Recipe with id "${input.recipeId}" not found`,
      );
    }
    if (recipe.visibility === "private" && recipe.userId !== userId) {
      throw new ForbiddenException("You do not have access to this recipe");
    }

    const entry = await this.db.mealPlanEntry.create({
      data: {
        mealPlanId: planId,
        recipeId: input.recipeId,
        date: new Date(input.date),
        slot: input.slot,
        servings: input.servings ?? recipe.servings,
      },
      include: {
        recipe: {
          include: {
            ingredients: { orderBy: { sortOrder: "asc" } },
            tags: { include: { tag: true } },
          },
        },
      },
    });

    return {
      ...entry,
      recipe: await this.uploadService.resolvePhotoUrl(entry.recipe),
    };
  }

  async updateEntry(
    planId: string,
    entryId: string,
    input: UpdateMealPlanEntryInput,
    userId: string,
  ) {
    const errors = validateUpdateMealPlanEntry(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const entry = await this.db.mealPlanEntry.findUnique({
      where: { id: entryId },
      include: { mealPlan: true },
    });
    if (!entry || entry.mealPlanId !== planId) {
      throw new NotFoundException(`Entry with id "${entryId}" not found`);
    }
    if (entry.mealPlan.userId !== userId) {
      throw new ForbiddenException("You do not have access to this meal plan");
    }

    const data: Record<string, unknown> = {};
    if (input.servings !== undefined) data.servings = input.servings;
    if (input.recipeId !== undefined) data.recipeId = input.recipeId;
    if (input.date !== undefined) data.date = new Date(input.date);
    if (input.slot !== undefined) data.slot = input.slot;

    return this.db.mealPlanEntry.update({
      where: { id: entryId },
      data,
      include: {
        recipe: {
          include: {
            ingredients: { orderBy: { sortOrder: "asc" } },
            tags: { include: { tag: true } },
          },
        },
      },
    });
  }

  async getGroceryList(planId: string, userId: string) {
    const plan = await this.db.mealPlan.findUnique({
      where: { id: planId },
      include: {
        entries: {
          include: {
            recipe: {
              include: {
                ingredients: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Meal plan with id "${planId}" not found`);
    }
    if (plan.userId !== userId) {
      throw new ForbiddenException("You do not have access to this meal plan");
    }

    return aggregateIngredients(plan.entries);
  }

  async removeEntry(planId: string, entryId: string, userId: string) {
    const entry = await this.db.mealPlanEntry.findUnique({
      where: { id: entryId },
      include: { mealPlan: true },
    });
    if (!entry || entry.mealPlanId !== planId) {
      throw new NotFoundException(`Entry with id "${entryId}" not found`);
    }
    if (entry.mealPlan.userId !== userId) {
      throw new ForbiddenException("You do not have access to this meal plan");
    }

    await this.db.mealPlanEntry.delete({ where: { id: entryId } });
    return { deleted: true };
  }
}

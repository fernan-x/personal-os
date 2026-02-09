import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { UploadService } from "../upload/upload.service";
import {
  validateCreateRecipe,
  validateUpdateRecipe,
} from "@personal-os/domain";
import type {
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeFilters,
} from "@personal-os/domain";
import type { Prisma } from "@personal-os/database";

@Injectable()
export class RecipeService {
  constructor(
    private readonly db: DatabaseService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(userId: string, filters: RecipeFilters) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.RecipeWhereInput = {
      OR: [{ visibility: "public" }, { userId }],
    };

    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      where.tags = { some: { tagId: { in: filters.tagIds } } };
    }

    if (filters.maxPrepTime != null) {
      where.prepTime = { lte: filters.maxPrepTime };
    }

    if (filters.maxCalories != null) {
      where.calories = { lte: filters.maxCalories };
    }

    if (filters.favorite) {
      where.favorites = { some: { userId } };
    }

    const [recipes, total] = await Promise.all([
      this.db.recipe.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          tags: { include: { tag: true } },
          favorites: { where: { userId }, select: { id: true } },
          _count: { select: { favorites: true } },
        },
      }),
      this.db.recipe.count({ where }),
    ]);

    const resolved = await this.uploadService.resolvePhotoUrls(recipes);
    const data = resolved.map((r) => ({
      ...r,
      isFavorited: r.favorites.length > 0,
      favorites: undefined,
    }));

    return { data, total, page, limit };
  }

  async findMine(userId: string) {
    const recipes = await this.db.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        favorites: { where: { userId }, select: { id: true } },
      },
    });

    const resolved = await this.uploadService.resolvePhotoUrls(recipes);
    return resolved.map((r) => ({
      ...r,
      isFavorited: r.favorites.length > 0,
      favorites: undefined,
    }));
  }

  async findOne(id: string, userId: string) {
    const recipe = await this.db.recipe.findUnique({
      where: { id },
      include: {
        ingredients: { orderBy: { sortOrder: "asc" } },
        instructions: { orderBy: { stepNumber: "asc" } },
        tags: { include: { tag: true } },
        favorites: { where: { userId }, select: { id: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id "${id}" not found`);
    }

    if (recipe.visibility === "private" && recipe.userId !== userId) {
      throw new ForbiddenException("You do not have access to this recipe");
    }

    const resolved = await this.uploadService.resolvePhotoUrl(recipe);
    return {
      ...resolved,
      isFavorited: resolved.favorites.length > 0,
      favorites: undefined,
    };
  }

  async create(input: CreateRecipeInput, userId: string) {
    const errors = validateCreateRecipe(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.recipe.create({
      data: {
        userId,
        title: input.title.trim(),
        description: input.description?.trim(),
        photoUrl: input.photoUrl,
        sourceUrl: input.sourceUrl?.trim(),
        visibility: input.visibility ?? "private",
        difficulty: input.difficulty ?? "medium",
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        servings: input.servings ?? 4,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        ingredients: {
          create: input.ingredients.map((ing, i) => ({
            name: ing.name.trim(),
            quantity: ing.quantity,
            unit: ing.unit,
            sortOrder: ing.sortOrder ?? i,
          })),
        },
        instructions: {
          create: input.instructions.map((ins, i) => ({
            stepNumber: ins.stepNumber ?? i + 1,
            content: ins.content.trim(),
          })),
        },
        ...(input.tagIds && input.tagIds.length > 0
          ? {
              tags: {
                create: input.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        ingredients: { orderBy: { sortOrder: "asc" } },
        instructions: { orderBy: { stepNumber: "asc" } },
        tags: { include: { tag: true } },
      },
    });
  }

  async update(id: string, input: UpdateRecipeInput, userId: string) {
    const errors = validateUpdateRecipe(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const recipe = await this.db.recipe.findUnique({ where: { id } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with id "${id}" not found`);
    }
    if (recipe.userId !== userId) {
      throw new ForbiddenException("You can only edit your own recipes");
    }

    return this.db.$transaction(async (tx) => {
      // Update basic fields
      const data: Prisma.RecipeUpdateInput = {};
      if (input.title !== undefined) data.title = input.title.trim();
      if (input.description !== undefined)
        data.description = input.description?.trim() ?? null;
      if (input.photoUrl !== undefined)
        data.photoUrl = input.photoUrl ?? null;
      if (input.sourceUrl !== undefined)
        data.sourceUrl = input.sourceUrl?.trim() ?? null;
      if (input.visibility !== undefined) data.visibility = input.visibility;
      if (input.difficulty !== undefined) data.difficulty = input.difficulty;
      if (input.prepTime !== undefined) data.prepTime = input.prepTime;
      if (input.cookTime !== undefined) data.cookTime = input.cookTime;
      if (input.servings !== undefined) data.servings = input.servings;
      if (input.calories !== undefined) data.calories = input.calories;
      if (input.protein !== undefined) data.protein = input.protein;
      if (input.carbs !== undefined) data.carbs = input.carbs;
      if (input.fat !== undefined) data.fat = input.fat;

      await tx.recipe.update({ where: { id }, data });

      // Replace ingredients if provided
      if (input.ingredients !== undefined) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await tx.recipeIngredient.createMany({
          data: input.ingredients.map((ing, i) => ({
            recipeId: id,
            name: ing.name.trim(),
            quantity: ing.quantity,
            unit: ing.unit,
            sortOrder: ing.sortOrder ?? i,
          })),
        });
      }

      // Replace instructions if provided
      if (input.instructions !== undefined) {
        await tx.recipeInstruction.deleteMany({ where: { recipeId: id } });
        await tx.recipeInstruction.createMany({
          data: input.instructions.map((ins, i) => ({
            recipeId: id,
            stepNumber: ins.stepNumber ?? i + 1,
            content: ins.content.trim(),
          })),
        });
      }

      // Replace tags if provided
      if (input.tagIds !== undefined) {
        await tx.recipeTagLink.deleteMany({ where: { recipeId: id } });
        if (input.tagIds.length > 0) {
          await tx.recipeTagLink.createMany({
            data: input.tagIds.map((tagId) => ({ recipeId: id, tagId })),
          });
        }
      }

      return tx.recipe.findUnique({
        where: { id },
        include: {
          ingredients: { orderBy: { sortOrder: "asc" } },
          instructions: { orderBy: { stepNumber: "asc" } },
          tags: { include: { tag: true } },
        },
      });
    });
  }

  async remove(id: string, userId: string) {
    const recipe = await this.db.recipe.findUnique({ where: { id } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with id "${id}" not found`);
    }
    if (recipe.userId !== userId) {
      throw new ForbiddenException("You can only delete your own recipes");
    }

    // Delete S3 photo if exists
    if (recipe.photoUrl && this.uploadService.isS3Key(recipe.photoUrl)) {
      await this.uploadService.delete(recipe.photoUrl).catch(() => {});
    }

    await this.db.recipe.delete({ where: { id } });
    return { deleted: true };
  }

  async toggleFavorite(recipeId: string, userId: string) {
    // Verify recipe exists and is accessible
    const recipe = await this.db.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with id "${recipeId}" not found`);
    }
    if (recipe.visibility === "private" && recipe.userId !== userId) {
      throw new ForbiddenException("You do not have access to this recipe");
    }

    const existing = await this.db.recipeFavorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      await this.db.recipeFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.db.recipeFavorite.create({
      data: { userId, recipeId },
    });
    return { favorited: true };
  }
}

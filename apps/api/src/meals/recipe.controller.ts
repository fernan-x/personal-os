import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { RecipeService } from "./recipe.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeFilters,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("meals/recipes")
@UseGuards(JwtAuthGuard)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("search") search?: string,
    @Query("difficulty") difficulty?: string,
    @Query("tagIds") tagIds?: string,
    @Query("maxPrepTime") maxPrepTime?: string,
    @Query("maxCalories") maxCalories?: string,
    @Query("favorite") favorite?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const filters: RecipeFilters = {
      search,
      difficulty: difficulty as RecipeFilters["difficulty"],
      tagIds: tagIds ? tagIds.split(",") : undefined,
      maxPrepTime: maxPrepTime ? Number(maxPrepTime) : undefined,
      maxCalories: maxCalories ? Number(maxCalories) : undefined,
      favorite: favorite === "true" ? true : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };
    return this.recipeService.findAll(user.id, filters);
  }

  @Get("mine")
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.recipeService.findMine(user.id);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recipeService.findOne(id, user.id);
  }

  @Post()
  create(
    @Body() input: CreateRecipeInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recipeService.create(input, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() input: UpdateRecipeInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recipeService.update(id, input, user.id);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recipeService.remove(id, user.id);
  }

  @Post(":id/favorite")
  toggleFavorite(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recipeService.toggleFavorite(id, user.id);
  }
}

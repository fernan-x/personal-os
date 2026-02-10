import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { MealPlanService } from "./meal-plan.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateMealPlanInput,
  UpdateMealPlanInput,
  CreateMealPlanEntryInput,
  UpdateMealPlanEntryInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("meals/plans")
@UseGuards(JwtAuthGuard)
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.mealPlanService.findAll(user.id);
  }

  @Post()
  create(
    @Body() input: CreateMealPlanInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.create(input, user.id);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.findOne(id, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() input: UpdateMealPlanInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.update(id, input, user.id);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.remove(id, user.id);
  }

  @Post(":id/entries")
  createEntry(
    @Param("id") planId: string,
    @Body() input: CreateMealPlanEntryInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.createEntry(planId, input, user.id);
  }

  @Patch(":id/entries/:entryId")
  updateEntry(
    @Param("id") planId: string,
    @Param("entryId") entryId: string,
    @Body() input: UpdateMealPlanEntryInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.updateEntry(planId, entryId, input, user.id);
  }

  @Delete(":id/entries/:entryId")
  removeEntry(
    @Param("id") planId: string,
    @Param("entryId") entryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mealPlanService.removeEntry(planId, entryId, user.id);
  }
}

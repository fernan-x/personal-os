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
import { HabitsService } from "./habits.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateHabitInput,
  UpdateHabitInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("habits")
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("date") date?: string,
  ) {
    return this.habitsService.findAll(user.id, date);
  }

  @Get("summary")
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.habitsService.getSummary(user.id, from, to);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.habitsService.findOne(id, user.id);
  }

  @Post()
  create(
    @Body() input: CreateHabitInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.create(input, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() input: UpdateHabitInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.update(id, input, user.id);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.remove(id, user.id);
  }

  @Post(":id/entries")
  logEntry(
    @Param("id") id: string,
    @Body() input: { date: string; completed: boolean; note?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.logEntry(
      id,
      {
        date: new Date(input.date),
        completed: input.completed,
        note: input.note,
      },
      user.id,
    );
  }
}

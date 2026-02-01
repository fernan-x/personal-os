import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from "@nestjs/common";
import { HabitsService } from "./habits.service";
import type { CreateHabitInput, UpdateHabitInput } from "@personal-os/domain";

@Controller("habits")
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll() {
    return this.habitsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.habitsService.findOne(id);
  }

  @Post()
  create(@Body() input: CreateHabitInput) {
    return this.habitsService.create(input);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() input: UpdateHabitInput) {
    return this.habitsService.update(id, input);
  }

  @Post(":id/entries")
  logEntry(
    @Param("id") id: string,
    @Body() input: { date: string; completed: boolean; note?: string },
  ) {
    return this.habitsService.logEntry(id, {
      date: new Date(input.date),
      completed: input.completed,
      note: input.note,
    });
  }
}

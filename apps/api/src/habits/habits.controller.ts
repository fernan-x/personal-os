import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from "@nestjs/common";
import { HabitsService } from "./habits.service";
import type { CreateHabitInput } from "@personal-os/domain";

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
}

import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ExpenseCategoryService } from "./expense-category.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { CreateExpenseCategoryInput, UpdateExpenseCategoryInput } from "@personal-os/domain";

@Controller("budget/categories")
@UseGuards(JwtAuthGuard)
export class ExpenseCategoryController {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Get()
  findAll() {
    return this.expenseCategoryService.findAll();
  }

  @Post()
  create(@Body() input: CreateExpenseCategoryInput) {
    return this.expenseCategoryService.create(input);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() input: UpdateExpenseCategoryInput) {
    return this.expenseCategoryService.update(id, input);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.expenseCategoryService.remove(id);
  }
}

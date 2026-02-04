import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ExpenseCategoryService } from "./expense-category.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { CreateExpenseCategoryInput } from "@personal-os/domain";

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
}

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
import { IncomeService } from "./income.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("budget/groups/:groupId/plans/:planId/incomes")
@UseGuards(JwtAuthGuard, BudgetGroupMemberGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(@Param("planId") planId: string) {
    return this.incomeService.findAll(planId);
  }

  @Post()
  create(
    @Param("planId") planId: string,
    @Body() input: CreateIncomeInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incomeService.create(planId, user.id, input);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() input: UpdateIncomeInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incomeService.update(id, user.id, input);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incomeService.remove(id, user.id);
  }
}

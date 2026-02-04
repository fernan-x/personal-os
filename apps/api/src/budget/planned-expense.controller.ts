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
import { PlannedExpenseService } from "./planned-expense.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreatePlannedExpenseInput,
  UpdatePlannedExpenseInput,
  UpdateExpenseStatusInput,
  CreateSharedExpenseInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("budget/groups/:groupId/plans/:planId/expenses")
@UseGuards(JwtAuthGuard, BudgetGroupMemberGuard)
export class PlannedExpenseController {
  constructor(
    private readonly plannedExpenseService: PlannedExpenseService,
  ) {}

  @Get()
  findAll(@Param("planId") planId: string) {
    return this.plannedExpenseService.findAll(planId);
  }

  @Post()
  create(
    @Param("planId") planId: string,
    @Body() input: CreatePlannedExpenseInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.plannedExpenseService.create(planId, user.id, input);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() input: UpdatePlannedExpenseInput,
  ) {
    return this.plannedExpenseService.update(id, input);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() input: UpdateExpenseStatusInput,
  ) {
    return this.plannedExpenseService.updateStatus(id, input);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.plannedExpenseService.remove(id);
  }

  @Post("shared")
  createShared(
    @Param("planId") planId: string,
    @Body() input: CreateSharedExpenseInput,
  ) {
    return this.plannedExpenseService.createShared(planId, input);
  }
}

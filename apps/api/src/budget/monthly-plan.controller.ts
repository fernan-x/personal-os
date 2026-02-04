import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { MonthlyPlanService } from "./monthly-plan.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";
import type { CreateMonthlyPlanInput } from "@personal-os/domain";

@Controller("budget/groups/:groupId/plans")
@UseGuards(JwtAuthGuard, BudgetGroupMemberGuard)
export class MonthlyPlanController {
  constructor(private readonly monthlyPlanService: MonthlyPlanService) {}

  @Get()
  findAll(@Param("groupId") groupId: string) {
    return this.monthlyPlanService.findAll(groupId);
  }

  @Post()
  create(
    @Param("groupId") groupId: string,
    @Body() input: CreateMonthlyPlanInput,
  ) {
    return this.monthlyPlanService.create(groupId, input);
  }

  @Get(":planId")
  findOne(
    @Param("groupId") groupId: string,
    @Param("planId") planId: string,
  ) {
    return this.monthlyPlanService.findOne(planId, groupId);
  }

  @Get(":planId/summary")
  getSummary(
    @Param("groupId") groupId: string,
    @Param("planId") planId: string,
  ) {
    return this.monthlyPlanService.getSummary(planId, groupId);
  }
}

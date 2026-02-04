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
import { BudgetGroupService } from "./budget-group.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateBudgetGroupInput,
  UpdateBudgetGroupInput,
  AddGroupMemberInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("budget/groups")
@UseGuards(JwtAuthGuard)
export class BudgetGroupController {
  constructor(private readonly budgetGroupService: BudgetGroupService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.budgetGroupService.findAll(user.id);
  }

  @Post()
  create(
    @Body() input: CreateBudgetGroupInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.budgetGroupService.create(input, user.id);
  }

  @Get(":groupId")
  @UseGuards(BudgetGroupMemberGuard)
  findOne(@Param("groupId") groupId: string) {
    return this.budgetGroupService.findOne(groupId);
  }

  @Patch(":groupId")
  @UseGuards(BudgetGroupMemberGuard)
  update(
    @Param("groupId") groupId: string,
    @Body() input: UpdateBudgetGroupInput,
  ) {
    return this.budgetGroupService.update(groupId, input);
  }

  @Post(":groupId/members")
  @UseGuards(BudgetGroupMemberGuard)
  addMember(
    @Param("groupId") groupId: string,
    @Body() input: AddGroupMemberInput,
  ) {
    return this.budgetGroupService.addMember(groupId, input);
  }

  @Delete(":groupId/members/:userId")
  @UseGuards(BudgetGroupMemberGuard)
  removeMember(
    @Param("groupId") groupId: string,
    @Param("userId") userId: string,
  ) {
    return this.budgetGroupService.removeMember(groupId, userId);
  }
}

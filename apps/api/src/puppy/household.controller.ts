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
import { HouseholdService } from "./household.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
  AddHouseholdMemberInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("puppy/households")
@UseGuards(JwtAuthGuard)
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.householdService.findAll(user.id);
  }

  @Post()
  create(
    @Body() input: CreateHouseholdInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.householdService.create(input, user.id);
  }

  @Get(":householdId")
  @UseGuards(HouseholdMemberGuard)
  findOne(@Param("householdId") householdId: string) {
    return this.householdService.findOne(householdId);
  }

  @Patch(":householdId")
  @UseGuards(HouseholdMemberGuard)
  update(
    @Param("householdId") householdId: string,
    @Body() input: UpdateHouseholdInput,
  ) {
    return this.householdService.update(householdId, input);
  }

  @Post(":householdId/members")
  @UseGuards(HouseholdMemberGuard)
  addMember(
    @Param("householdId") householdId: string,
    @Body() input: AddHouseholdMemberInput,
  ) {
    return this.householdService.addMember(householdId, input);
  }

  @Delete(":householdId/members/:userId")
  @UseGuards(HouseholdMemberGuard)
  removeMember(
    @Param("householdId") householdId: string,
    @Param("userId") userId: string,
  ) {
    return this.householdService.removeMember(householdId, userId);
  }
}

import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DailyChecklistService } from "./daily-checklist.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "@personal-os/domain";

@Controller("puppy/households/:householdId")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class DailyChecklistController {
  constructor(private readonly dailyChecklistService: DailyChecklistService) {}

  @Get("today")
  getToday(@Param("householdId") householdId: string) {
    return this.dailyChecklistService.getTodayForHousehold(householdId);
  }

  @Get("pets/:petId/checklist")
  getChecklist(
    @Param("petId") petId: string,
    @Query("date") date?: string,
  ) {
    const d = date ? new Date(date) : new Date();
    return this.dailyChecklistService.getOrGenerateForDate(petId, d);
  }

  @Patch("pets/:petId/checklist/:itemId")
  toggleItem(
    @Param("itemId") itemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dailyChecklistService.toggleItem(itemId, user.id);
  }
}

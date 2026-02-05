import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ActivityLogService } from "./activity-log.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateActivityLogInput,
  ActivityType,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/activities")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(
    @Param("petId") petId: string,
    @Query("type") type?: ActivityType,
    @Query("userId") userId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.activityLogService.findAll(petId, {
      type,
      userId,
      startDate,
      endDate,
    });
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateActivityLogInput,
  ) {
    return this.activityLogService.create(petId, user.id, input);
  }

  @Delete(":logId")
  remove(@Param("logId") logId: string) {
    return this.activityLogService.remove(logId);
  }

  @Get("last/:type")
  getLastByType(
    @Param("petId") petId: string,
    @Param("type") type: ActivityType,
  ) {
    return this.activityLogService.getLastByType(petId, type);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  AuthenticatedUser,
  CreateDashboardWidgetInput,
  UpdateDashboardWidgetInput,
  SetDashboardInput,
} from "@personal-os/domain";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("widgets")
  getWidgets(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getUserWidgets(user.id);
  }

  @Post("widgets")
  addWidget(
    @Body() input: CreateDashboardWidgetInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dashboardService.addWidget(input, user.id);
  }

  @Patch("widgets/:id")
  updateWidget(
    @Param("id") id: string,
    @Body() input: UpdateDashboardWidgetInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dashboardService.updateWidget(id, input, user.id);
  }

  @Delete("widgets/:id")
  removeWidget(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dashboardService.removeWidget(id, user.id);
  }

  @Put()
  setDashboard(
    @Body() input: SetDashboardInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dashboardService.setDashboard(input, user.id);
  }
}

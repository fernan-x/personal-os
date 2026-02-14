import { Controller, Get, Patch, Put, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsersService } from "./users.service";
import type {
  AuthenticatedUser,
  UpdateProfileInput,
  UpdateModulesInput,
  UpdateNutritionalProfileInput,
} from "@personal-os/domain";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch("me")
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(user.id, input);
  }

  @Put("me/modules")
  updateModules(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateModulesInput,
  ) {
    return this.usersService.updateModules(user.id, input);
  }

  @Get("me/nutrition")
  getNutrition(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getNutrition(user.id);
  }

  @Patch("me/nutrition")
  updateNutrition(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateNutritionalProfileInput,
  ) {
    return this.usersService.updateNutrition(user.id, input);
  }
}

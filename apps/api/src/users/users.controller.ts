import { Controller, Patch, Put, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsersService } from "./users.service";
import type {
  AuthenticatedUser,
  UpdateProfileInput,
  UpdateModulesInput,
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
}

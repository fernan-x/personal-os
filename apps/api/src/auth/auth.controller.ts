import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import type {
  RegisterUserInput,
  LoginInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() input: RegisterUserInput) {
    return this.authService.register(input);
  }

  @Post("login")
  login(@Body() input: LoginInput) {
    return this.authService.login(input);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user);
  }
}

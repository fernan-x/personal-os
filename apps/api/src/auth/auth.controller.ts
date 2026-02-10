import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { OidcService } from "./oidc.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import type {
  RegisterUserInput,
  LoginInput,
  AuthenticatedUser,
} from "@personal-os/domain";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly oidcService: OidcService,
  ) {}

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

  @Get("oidc/status")
  getOidcStatus() {
    return { enabled: this.oidcService.isConfigured };
  }

  @Get("oidc/login")
  oidcLogin(@Res() res: Response) {
    if (!this.oidcService.isConfigured) {
      return res.redirect(`${FRONTEND_URL}/login?error=sso_unavailable`);
    }

    const { url, state, nonce } = this.oidcService.generateAuthUrl();
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("oidc_state", state, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie("oidc_nonce", nonce, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    return res.redirect(url);
  }

  @Get("oidc/callback")
  async oidcCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const expectedState = req.cookies?.["oidc_state"];
      const expectedNonce = req.cookies?.["oidc_nonce"];

      if (!expectedState || !expectedNonce) {
        return res.redirect(`${FRONTEND_URL}/login?error=sso_failed`);
      }

      // Clear cookies
      res.clearCookie("oidc_state");
      res.clearCookie("oidc_nonce");

      const authResponse = await this.oidcService.handleCallback(
        code,
        state,
        expectedState,
        expectedNonce,
      );

      return res.redirect(
        `${FRONTEND_URL}/auth/sso-callback?token=${authResponse.accessToken}`,
      );
    } catch (error) {
      this.logger.error(`OIDC callback error: ${error}`);
      return res.redirect(`${FRONTEND_URL}/login?error=sso_failed`);
    }
  }
}

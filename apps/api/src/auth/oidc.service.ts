import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Issuer, Client, generators } from "openid-client";
import { DatabaseService } from "../database/database.service";
import {
  SSO_PROVIDER_AUTHENTIK,
  type AuthResponse,
  type AuthTokenPayload,
} from "@personal-os/domain";

@Injectable()
export class OidcService implements OnModuleInit {
  private readonly logger = new Logger(OidcService.name);
  private client: Client | null = null;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async onModuleInit() {
    const issuerUrl = process.env.OIDC_ISSUER_URL;
    const clientId = process.env.OIDC_CLIENT_ID;
    const clientSecret = process.env.OIDC_CLIENT_SECRET;

    if (!issuerUrl || !clientId || !clientSecret) {
      this.logger.warn(
        "OIDC env vars not set (OIDC_ISSUER_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET). SSO disabled.",
      );
      return;
    }

    try {
      const issuer = await Issuer.discover(issuerUrl);
      this.client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [process.env.OIDC_REDIRECT_URI || "http://localhost:3001/api/auth/oidc/callback"],
        response_types: ["code"],
      });
      this.logger.log(`OIDC configured with issuer: ${issuerUrl}`);
    } catch (error) {
      this.logger.error(`Failed to discover OIDC issuer: ${error}`);
    }
  }

  generateAuthUrl(): { url: string; state: string; nonce: string } {
    if (!this.client) {
      throw new Error("OIDC not configured");
    }

    const state = generators.state();
    const nonce = generators.nonce();

    const url = this.client.authorizationUrl({
      scope: "openid email profile",
      state,
      nonce,
    });

    return { url, state, nonce };
  }

  async handleCallback(
    code: string,
    state: string,
    expectedState: string,
    expectedNonce: string,
  ): Promise<AuthResponse> {
    if (!this.client) {
      throw new Error("OIDC not configured");
    }

    if (state !== expectedState) {
      throw new Error("Invalid state parameter");
    }

    const redirectUri =
      process.env.OIDC_REDIRECT_URI ||
      "http://localhost:3001/api/auth/oidc/callback";

    const tokenSet = await this.client.callback(redirectUri, { code, state }, { state: expectedState, nonce: expectedNonce });

    const claims = tokenSet.claims();
    const sub = claims.sub;
    const email = claims.email as string | undefined;
    const name = (claims.name as string | undefined) ||
      (claims.preferred_username as string | undefined) ||
      null;

    if (!email) {
      throw new Error("No email claim in ID token");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Lookup by ssoProvider + ssoId
    let user = await this.db.user.findFirst({
      where: { ssoProvider: SSO_PROVIDER_AUTHENTIK, ssoId: sub },
    });

    if (!user) {
      // 2. Lookup by email → link existing account
      user = await this.db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        user = await this.db.user.update({
          where: { id: user.id },
          data: { ssoProvider: SSO_PROVIDER_AUTHENTIK, ssoId: sub },
        });
      } else {
        // 3. Create new user
        user = await this.db.user.create({
          data: {
            email: normalizedEmail,
            name,
            isActive: true,
            ssoProvider: SSO_PROVIDER_AUTHENTIK,
            ssoId: sub,
          },
        });
      }
    }

    if (!user.isActive) {
      throw new Error("Account is not active");
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        ssoProvider: user.ssoProvider,
        enabledModules: user.enabledModules,
      },
      accessToken,
    };
  }
}

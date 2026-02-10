import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OidcService } from "./oidc.service";
import { JwtStrategy } from "./jwt.strategy";
import { JWT_EXPIRATION } from "@personal-os/domain";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
      signOptions: { expiresIn: JWT_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OidcService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}

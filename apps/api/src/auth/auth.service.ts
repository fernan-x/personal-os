import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { DatabaseService } from "../database/database.service";
import {
  validateRegisterUser,
  validateLogin,
  type RegisterUserInput,
  type LoginInput,
  type AuthResponse,
  type AuthenticatedUser,
  type AuthTokenPayload,
} from "@personal-os/domain";

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterUserInput): Promise<{ message: string }> {
    const errors = validateRegisterUser(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const existingUser = await this.db.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    await this.db.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        password: hashedPassword,
        name: input.name?.trim() || null,
        isActive: false,
      },
    });

    return {
      message:
        "Registration successful. Your account is pending activation by an administrator.",
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const errors = validateLogin(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const user = await this.db.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        "Account is not active. Please wait for administrator approval.",
      );
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
      },
      accessToken,
    };
  }

  getProfile(user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}

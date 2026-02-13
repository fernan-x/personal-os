import { Injectable, BadRequestException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateUpdateProfile,
  validateUpdateModules,
  type AuthenticatedUser,
  type UpdateProfileInput,
  type UpdateModulesInput,
} from "@personal-os/domain";

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<AuthenticatedUser> {
    const errors = validateUpdateProfile(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const user = await this.db.user.update({
      where: { id: userId },
      data: { name: input.name?.trim() ?? undefined },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      ssoProvider: user.ssoProvider,
      enabledModules: user.enabledModules,
    };
  }

  async updateModules(
    userId: string,
    input: UpdateModulesInput,
  ): Promise<AuthenticatedUser> {
    const errors = validateUpdateModules(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const user = await this.db.user.update({
      where: { id: userId },
      data: { enabledModules: input.enabledModules },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      ssoProvider: user.ssoProvider,
      enabledModules: user.enabledModules,
    };
  }
}

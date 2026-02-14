import { Injectable, BadRequestException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateUpdateProfile,
  validateUpdateModules,
  validateUpdateNutritionalProfile,
  type AuthenticatedUser,
  type UpdateProfileInput,
  type UpdateModulesInput,
  type UpdateNutritionalProfileInput,
  type NutritionalProfileResponse,
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

  async getNutrition(userId: string): Promise<NutritionalProfileResponse> {
    const user = await this.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        weight: true,
        height: true,
        birthDate: true,
        gender: true,
        activityLevel: true,
        fitnessGoal: true,
      },
    });

    return {
      weight: user.weight,
      height: user.height,
      birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
      gender: user.gender,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
    };
  }

  async updateNutrition(
    userId: string,
    input: UpdateNutritionalProfileInput,
  ): Promise<NutritionalProfileResponse> {
    const errors = validateUpdateNutritionalProfile(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const data: Record<string, unknown> = {};
    if (input.weight !== undefined) data.weight = input.weight;
    if (input.height !== undefined) data.height = input.height;
    if (input.birthDate !== undefined)
      data.birthDate = input.birthDate ? new Date(input.birthDate) : null;
    if (input.gender !== undefined) data.gender = input.gender;
    if (input.activityLevel !== undefined)
      data.activityLevel = input.activityLevel;
    if (input.fitnessGoal !== undefined) data.fitnessGoal = input.fitnessGoal;

    const user = await this.db.user.update({
      where: { id: userId },
      data,
      select: {
        weight: true,
        height: true,
        birthDate: true,
        gender: true,
        activityLevel: true,
        fitnessGoal: true,
      },
    });

    return {
      weight: user.weight,
      height: user.height,
      birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
      gender: user.gender,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateHousehold,
  validateUpdateHousehold,
  validateAddHouseholdMember,
  MAX_HOUSEHOLD_MEMBERS,
} from "@personal-os/domain";
import type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
  AddHouseholdMemberInput,
} from "@personal-os/domain";

const MEMBER_INCLUDE = {
  members: {
    include: { user: { select: { id: true, email: true, name: true } } },
  },
};

@Injectable()
export class HouseholdService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId: string) {
    return this.db.household.findMany({
      where: { members: { some: { userId } } },
      include: {
        ...MEMBER_INCLUDE,
        pets: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const household = await this.db.household.findUnique({
      where: { id },
      include: {
        ...MEMBER_INCLUDE,
        pets: true,
      },
    });

    if (!household) {
      throw new NotFoundException("Household not found");
    }

    return household;
  }

  async create(input: CreateHouseholdInput, userId: string) {
    const errors = validateCreateHousehold(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.household.create({
      data: {
        name: input.name.trim(),
        members: { create: { userId } },
      },
      include: {
        ...MEMBER_INCLUDE,
        pets: true,
      },
    });
  }

  async update(id: string, input: UpdateHouseholdInput) {
    const errors = validateUpdateHousehold(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.household.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
      },
      include: {
        ...MEMBER_INCLUDE,
        pets: true,
      },
    });
  }

  async addMember(householdId: string, input: AddHouseholdMemberInput) {
    const errors = validateAddHouseholdMember(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const memberCount = await this.db.householdMember.count({
      where: { householdId },
    });

    if (memberCount >= MAX_HOUSEHOLD_MEMBERS) {
      throw new BadRequestException(
        `A household can have at most ${MAX_HOUSEHOLD_MEMBERS} members`,
      );
    }

    const user = await this.db.user.findUnique({
      where: { email: input.email.trim() },
    });

    if (!user) {
      throw new NotFoundException(`User with email "${input.email}" not found`);
    }

    const existing = await this.db.householdMember.findUnique({
      where: { userId_householdId: { userId: user.id, householdId } },
    });

    if (existing) {
      throw new ConflictException("User is already a member of this household");
    }

    await this.db.householdMember.create({
      data: { userId: user.id, householdId },
    });

    return this.findOne(householdId);
  }

  async removeMember(householdId: string, userId: string) {
    const membership = await this.db.householdMember.findUnique({
      where: { userId_householdId: { userId, householdId } },
    });

    if (!membership) {
      throw new NotFoundException("Membership not found");
    }

    const memberCount = await this.db.householdMember.count({
      where: { householdId },
    });

    if (memberCount <= 1) {
      throw new BadRequestException("Cannot remove the last member of a household");
    }

    await this.db.householdMember.delete({
      where: { id: membership.id },
    });

    return this.findOne(householdId);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateBudgetGroup,
  validateUpdateBudgetGroup,
  validateAddGroupMember,
} from "@personal-os/domain";
import type {
  CreateBudgetGroupInput,
  UpdateBudgetGroupInput,
  AddGroupMemberInput,
} from "@personal-os/domain";

@Injectable()
export class BudgetGroupService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId: string) {
    return this.db.budgetGroup.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(groupId: string) {
    const group = await this.db.budgetGroup.findUnique({
      where: { id: groupId },
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
    });

    if (!group) {
      throw new NotFoundException(`Budget group not found`);
    }

    return group;
  }

  async create(input: CreateBudgetGroupInput, userId: string) {
    const errors = validateCreateBudgetGroup(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.budgetGroup.create({
      data: {
        name: input.name.trim(),
        members: { create: { userId } },
      },
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
    });
  }

  async update(groupId: string, input: UpdateBudgetGroupInput) {
    const errors = validateUpdateBudgetGroup(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.budgetGroup.update({
      where: { id: groupId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
      },
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
    });
  }

  async addMember(groupId: string, input: AddGroupMemberInput) {
    const errors = validateAddGroupMember(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const user = await this.db.user.findUnique({
      where: { email: input.email.trim() },
    });

    if (!user) {
      throw new NotFoundException(`User with email "${input.email}" not found`);
    }

    const existing = await this.db.budgetMembership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } },
    });

    if (existing) {
      throw new ConflictException("User is already a member of this group");
    }

    await this.db.budgetMembership.create({
      data: { userId: user.id, groupId },
    });

    return this.findOne(groupId);
  }

  async removeMember(groupId: string, userId: string) {
    const membership = await this.db.budgetMembership.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      throw new NotFoundException("Membership not found");
    }

    const memberCount = await this.db.budgetMembership.count({
      where: { groupId },
    });

    if (memberCount <= 1) {
      throw new BadRequestException("Cannot remove the last member of a group");
    }

    await this.db.budgetMembership.delete({
      where: { id: membership.id },
    });

    return this.findOne(groupId);
  }
}

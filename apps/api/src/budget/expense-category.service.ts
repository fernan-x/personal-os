import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateExpenseCategory, validateUpdateExpenseCategory } from "@personal-os/domain";
import type { CreateExpenseCategoryInput, UpdateExpenseCategoryInput } from "@personal-os/domain";

@Injectable()
export class ExpenseCategoryService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.expenseCategory.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  async create(input: CreateExpenseCategoryInput) {
    const errors = validateCreateExpenseCategory(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const existing = await this.db.expenseCategory.findUnique({
      where: { name: input.name.trim() },
    });

    if (existing) {
      throw new ConflictException(`Category "${input.name}" already exists`);
    }

    return this.db.expenseCategory.create({
      data: {
        name: input.name.trim(),
        icon: input.icon?.trim(),
        isDefault: false,
        autoCreateEnvelope: input.autoCreateEnvelope ?? false,
      },
    });
  }

  async update(id: string, input: UpdateExpenseCategoryInput) {
    const errors = validateUpdateExpenseCategory(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const category = await this.db.expenseCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (input.name !== undefined && input.name.trim() !== category.name) {
      const existing = await this.db.expenseCategory.findUnique({
        where: { name: input.name.trim() },
      });
      if (existing) {
        throw new ConflictException(`Category "${input.name}" already exists`);
      }
    }

    return this.db.expenseCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.icon !== undefined && { icon: input.icon?.trim() ?? null }),
        ...(input.autoCreateEnvelope !== undefined && { autoCreateEnvelope: input.autoCreateEnvelope }),
      },
    });
  }

  async remove(id: string) {
    const category = await this.db.expenseCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    await this.db.expenseCategory.delete({ where: { id } });
    return { deleted: true };
  }
}

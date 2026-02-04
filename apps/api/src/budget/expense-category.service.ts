import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateExpenseCategory } from "@personal-os/domain";
import type { CreateExpenseCategoryInput } from "@personal-os/domain";

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
      },
    });
  }
}

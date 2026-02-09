import { Injectable, BadRequestException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { TAG_NAME_MAX_LENGTH } from "@personal-os/domain";

@Injectable()
export class RecipeTagService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.recipeTag.findMany({
      orderBy: { name: "asc" },
    });
  }

  async upsert(name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length === 0) {
      throw new BadRequestException("Tag name is required");
    }
    if (trimmed.length > TAG_NAME_MAX_LENGTH) {
      throw new BadRequestException(
        `Tag name must be at most ${TAG_NAME_MAX_LENGTH} characters`,
      );
    }

    return this.db.recipeTag.upsert({
      where: { name: trimmed },
      create: { name: trimmed },
      update: {},
    });
  }
}

import { Module } from "@nestjs/common";
import { RecipeController } from "./recipe.controller";
import { RecipeService } from "./recipe.service";
import { RecipeTagController } from "./recipe-tag.controller";
import { RecipeTagService } from "./recipe-tag.service";

@Module({
  controllers: [RecipeController, RecipeTagController],
  providers: [RecipeService, RecipeTagService],
})
export class MealsModule {}

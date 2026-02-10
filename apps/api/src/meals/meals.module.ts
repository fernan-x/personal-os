import { Module } from "@nestjs/common";
import { RecipeController } from "./recipe.controller";
import { RecipeService } from "./recipe.service";
import { RecipeTagController } from "./recipe-tag.controller";
import { RecipeTagService } from "./recipe-tag.service";
import { MealPlanController } from "./meal-plan.controller";
import { MealPlanService } from "./meal-plan.service";

@Module({
  controllers: [RecipeController, RecipeTagController, MealPlanController],
  providers: [RecipeService, RecipeTagService, MealPlanService],
})
export class MealsModule {}

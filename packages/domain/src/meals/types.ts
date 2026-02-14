import type {
  RecipeVisibility,
  RecipeDifficulty,
  IngredientUnit,
  MealSlot,
} from "@personal-os/database";

// ── Recipe ───────────────────────────────────────────────────

export interface RecipeIngredientInput {
  name: string;
  quantity: number;
  unit: IngredientUnit;
  sortOrder: number;
}

export interface RecipeInstructionInput {
  stepNumber: number;
  content: string;
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  photoUrl?: string;
  sourceUrl?: string;
  visibility?: RecipeVisibility;
  difficulty?: RecipeDifficulty;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  ingredients: RecipeIngredientInput[];
  instructions: RecipeInstructionInput[];
  tagIds?: string[];
}

export interface UpdateRecipeInput {
  title?: string;
  description?: string | null;
  photoUrl?: string | null;
  sourceUrl?: string | null;
  visibility?: RecipeVisibility;
  difficulty?: RecipeDifficulty;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  ingredients?: RecipeIngredientInput[];
  instructions?: RecipeInstructionInput[];
  tagIds?: string[];
}

export interface RecipeFilters {
  search?: string;
  difficulty?: RecipeDifficulty;
  tagIds?: string[];
  maxPrepTime?: number;
  maxCalories?: number;
  favorite?: boolean;
  page?: number;
  limit?: number;
}

// ── Meal Plan ────────────────────────────────────────────────

export interface CreateMealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateMealPlanInput {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateMealPlanEntryInput {
  recipeId: string;
  date: string;
  slot: MealSlot;
  servings?: number;
}

export interface UpdateMealPlanEntryInput {
  recipeId?: string;
  servings?: number;
  date?: string;
  slot?: MealSlot;
}

export interface GenerateMealPlanInput {
  startDate: string;
  endDate: string;
  slots: MealSlot[];
  tagIds?: string[];
  maxPrepTime?: number;
  name?: string;
  calorieTarget?: number;
}

// ── Grocery ──────────────────────────────────────────────────

export interface GroceryItem {
  name: string;
  quantity: number;
  unit: IngredientUnit;
  recipes: string[];
}

export type GroceryList = GroceryItem[];

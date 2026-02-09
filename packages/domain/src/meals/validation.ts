import type { RecipeVisibility, RecipeDifficulty, IngredientUnit, MealSlot } from "@personal-os/database";
import type { ValidationError } from "../common/index.ts";
import type {
  CreateRecipeInput,
  UpdateRecipeInput,
  CreateMealPlanInput,
  CreateMealPlanEntryInput,
  GenerateMealPlanInput,
} from "./types.ts";
import {
  RECIPE_TITLE_MAX_LENGTH,
  RECIPE_DESCRIPTION_MAX_LENGTH,
  SOURCE_URL_MAX_LENGTH,
  INGREDIENT_NAME_MAX_LENGTH,
  INSTRUCTION_CONTENT_MAX_LENGTH,
  MAX_INGREDIENTS,
  MAX_INSTRUCTIONS,
  MAX_TAGS,
  MAX_SERVINGS,
  MAX_TIME_MINUTES,
  MEAL_PLAN_NAME_MAX_LENGTH,
  RECIPE_VISIBILITIES,
  RECIPE_DIFFICULTIES,
  INGREDIENT_UNITS,
  MEAL_SLOTS,
} from "./constants.ts";

function isValidVisibility(v: string): v is RecipeVisibility {
  return (RECIPE_VISIBILITIES as readonly string[]).includes(v);
}

function isValidDifficulty(v: string): v is RecipeDifficulty {
  return (RECIPE_DIFFICULTIES as readonly string[]).includes(v);
}

function isValidUnit(v: string): v is IngredientUnit {
  return (INGREDIENT_UNITS as readonly string[]).includes(v);
}

function isValidSlot(v: string): v is MealSlot {
  return (MEAL_SLOTS as readonly string[]).includes(v);
}

function validateTime(
  value: number | null | undefined,
  field: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (value !== null && value !== undefined) {
    if (!Number.isInteger(value) || value < 0) {
      errors.push({ field, message: `${field} must be a positive integer` });
    } else if (value > MAX_TIME_MINUTES) {
      errors.push({
        field,
        message: `${field} must be at most ${MAX_TIME_MINUTES} minutes`,
      });
    }
  }
  return errors;
}

function validateMacro(
  value: number | null | undefined,
  field: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (value !== null && value !== undefined) {
    if (!Number.isInteger(value) || value < 0) {
      errors.push({ field, message: `${field} must be a positive integer` });
    }
  }
  return errors;
}

export function validateCreateRecipe(
  input: CreateRecipeInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title
  if (!input.title || input.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (input.title.length > RECIPE_TITLE_MAX_LENGTH) {
    errors.push({
      field: "title",
      message: `Title must be at most ${RECIPE_TITLE_MAX_LENGTH} characters`,
    });
  }

  // Description
  if (
    input.description &&
    input.description.length > RECIPE_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push({
      field: "description",
      message: `Description must be at most ${RECIPE_DESCRIPTION_MAX_LENGTH} characters`,
    });
  }

  // Source URL
  if (input.sourceUrl && input.sourceUrl.length > SOURCE_URL_MAX_LENGTH) {
    errors.push({
      field: "sourceUrl",
      message: `Source URL must be at most ${SOURCE_URL_MAX_LENGTH} characters`,
    });
  }

  // Visibility
  if (input.visibility && !isValidVisibility(input.visibility)) {
    errors.push({
      field: "visibility",
      message: `Visibility must be one of: ${RECIPE_VISIBILITIES.join(", ")}`,
    });
  }

  // Difficulty
  if (input.difficulty && !isValidDifficulty(input.difficulty)) {
    errors.push({
      field: "difficulty",
      message: `Difficulty must be one of: ${RECIPE_DIFFICULTIES.join(", ")}`,
    });
  }

  // Times
  errors.push(...validateTime(input.prepTime, "prepTime"));
  errors.push(...validateTime(input.cookTime, "cookTime"));

  // Servings
  if (input.servings !== undefined) {
    if (!Number.isInteger(input.servings) || input.servings < 1) {
      errors.push({
        field: "servings",
        message: "Servings must be at least 1",
      });
    } else if (input.servings > MAX_SERVINGS) {
      errors.push({
        field: "servings",
        message: `Servings must be at most ${MAX_SERVINGS}`,
      });
    }
  }

  // Macros
  errors.push(...validateMacro(input.calories, "calories"));
  errors.push(...validateMacro(input.protein, "protein"));
  errors.push(...validateMacro(input.carbs, "carbs"));
  errors.push(...validateMacro(input.fat, "fat"));

  // Ingredients
  if (!input.ingredients || input.ingredients.length === 0) {
    errors.push({
      field: "ingredients",
      message: "At least one ingredient is required",
    });
  } else if (input.ingredients.length > MAX_INGREDIENTS) {
    errors.push({
      field: "ingredients",
      message: `At most ${MAX_INGREDIENTS} ingredients are allowed`,
    });
  } else {
    for (let i = 0; i < input.ingredients.length; i++) {
      const ing = input.ingredients[i];
      if (!ing.name || ing.name.trim().length === 0) {
        errors.push({
          field: `ingredients[${i}].name`,
          message: "Ingredient name is required",
        });
      } else if (ing.name.length > INGREDIENT_NAME_MAX_LENGTH) {
        errors.push({
          field: `ingredients[${i}].name`,
          message: `Ingredient name must be at most ${INGREDIENT_NAME_MAX_LENGTH} characters`,
        });
      }
      if (ing.quantity <= 0) {
        errors.push({
          field: `ingredients[${i}].quantity`,
          message: "Quantity must be positive",
        });
      }
      if (!isValidUnit(ing.unit)) {
        errors.push({
          field: `ingredients[${i}].unit`,
          message: `Unit must be one of: ${INGREDIENT_UNITS.join(", ")}`,
        });
      }
    }
  }

  // Instructions
  if (!input.instructions || input.instructions.length === 0) {
    errors.push({
      field: "instructions",
      message: "At least one instruction is required",
    });
  } else if (input.instructions.length > MAX_INSTRUCTIONS) {
    errors.push({
      field: "instructions",
      message: `At most ${MAX_INSTRUCTIONS} instructions are allowed`,
    });
  } else {
    for (let i = 0; i < input.instructions.length; i++) {
      const ins = input.instructions[i];
      if (!ins.content || ins.content.trim().length === 0) {
        errors.push({
          field: `instructions[${i}].content`,
          message: "Instruction content is required",
        });
      } else if (ins.content.length > INSTRUCTION_CONTENT_MAX_LENGTH) {
        errors.push({
          field: `instructions[${i}].content`,
          message: `Instruction must be at most ${INSTRUCTION_CONTENT_MAX_LENGTH} characters`,
        });
      }
    }
  }

  // Tags
  if (input.tagIds && input.tagIds.length > MAX_TAGS) {
    errors.push({
      field: "tagIds",
      message: `At most ${MAX_TAGS} tags are allowed`,
    });
  }

  return errors;
}

export function validateUpdateRecipe(
  input: UpdateRecipeInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.title !== undefined) {
    if (!input.title || input.title.trim().length === 0) {
      errors.push({ field: "title", message: "Title is required" });
    } else if (input.title.length > RECIPE_TITLE_MAX_LENGTH) {
      errors.push({
        field: "title",
        message: `Title must be at most ${RECIPE_TITLE_MAX_LENGTH} characters`,
      });
    }
  }

  if (
    input.description !== undefined &&
    input.description !== null &&
    input.description.length > RECIPE_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push({
      field: "description",
      message: `Description must be at most ${RECIPE_DESCRIPTION_MAX_LENGTH} characters`,
    });
  }

  if (
    input.sourceUrl !== undefined &&
    input.sourceUrl !== null &&
    input.sourceUrl.length > SOURCE_URL_MAX_LENGTH
  ) {
    errors.push({
      field: "sourceUrl",
      message: `Source URL must be at most ${SOURCE_URL_MAX_LENGTH} characters`,
    });
  }

  if (input.visibility !== undefined && !isValidVisibility(input.visibility)) {
    errors.push({
      field: "visibility",
      message: `Visibility must be one of: ${RECIPE_VISIBILITIES.join(", ")}`,
    });
  }

  if (input.difficulty !== undefined && !isValidDifficulty(input.difficulty)) {
    errors.push({
      field: "difficulty",
      message: `Difficulty must be one of: ${RECIPE_DIFFICULTIES.join(", ")}`,
    });
  }

  errors.push(...validateTime(input.prepTime, "prepTime"));
  errors.push(...validateTime(input.cookTime, "cookTime"));

  if (input.servings !== undefined) {
    if (!Number.isInteger(input.servings) || input.servings < 1) {
      errors.push({
        field: "servings",
        message: "Servings must be at least 1",
      });
    } else if (input.servings > MAX_SERVINGS) {
      errors.push({
        field: "servings",
        message: `Servings must be at most ${MAX_SERVINGS}`,
      });
    }
  }

  errors.push(...validateMacro(input.calories, "calories"));
  errors.push(...validateMacro(input.protein, "protein"));
  errors.push(...validateMacro(input.carbs, "carbs"));
  errors.push(...validateMacro(input.fat, "fat"));

  if (input.ingredients !== undefined) {
    if (input.ingredients.length === 0) {
      errors.push({
        field: "ingredients",
        message: "At least one ingredient is required",
      });
    } else if (input.ingredients.length > MAX_INGREDIENTS) {
      errors.push({
        field: "ingredients",
        message: `At most ${MAX_INGREDIENTS} ingredients are allowed`,
      });
    } else {
      for (let i = 0; i < input.ingredients.length; i++) {
        const ing = input.ingredients[i];
        if (!ing.name || ing.name.trim().length === 0) {
          errors.push({
            field: `ingredients[${i}].name`,
            message: "Ingredient name is required",
          });
        } else if (ing.name.length > INGREDIENT_NAME_MAX_LENGTH) {
          errors.push({
            field: `ingredients[${i}].name`,
            message: `Ingredient name must be at most ${INGREDIENT_NAME_MAX_LENGTH} characters`,
          });
        }
        if (ing.quantity <= 0) {
          errors.push({
            field: `ingredients[${i}].quantity`,
            message: "Quantity must be positive",
          });
        }
        if (!isValidUnit(ing.unit)) {
          errors.push({
            field: `ingredients[${i}].unit`,
            message: `Unit must be one of: ${INGREDIENT_UNITS.join(", ")}`,
          });
        }
      }
    }
  }

  if (input.instructions !== undefined) {
    if (input.instructions.length === 0) {
      errors.push({
        field: "instructions",
        message: "At least one instruction is required",
      });
    } else if (input.instructions.length > MAX_INSTRUCTIONS) {
      errors.push({
        field: "instructions",
        message: `At most ${MAX_INSTRUCTIONS} instructions are allowed`,
      });
    } else {
      for (let i = 0; i < input.instructions.length; i++) {
        const ins = input.instructions[i];
        if (!ins.content || ins.content.trim().length === 0) {
          errors.push({
            field: `instructions[${i}].content`,
            message: "Instruction content is required",
          });
        } else if (ins.content.length > INSTRUCTION_CONTENT_MAX_LENGTH) {
          errors.push({
            field: `instructions[${i}].content`,
            message: `Instruction must be at most ${INSTRUCTION_CONTENT_MAX_LENGTH} characters`,
          });
        }
      }
    }
  }

  if (input.tagIds !== undefined && input.tagIds.length > MAX_TAGS) {
    errors.push({
      field: "tagIds",
      message: `At most ${MAX_TAGS} tags are allowed`,
    });
  }

  return errors;
}

export function validateCreateMealPlan(
  input: CreateMealPlanInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > MEAL_PLAN_NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${MEAL_PLAN_NAME_MAX_LENGTH} characters`,
    });
  }

  if (!input.startDate) {
    errors.push({ field: "startDate", message: "Start date is required" });
  }

  if (!input.endDate) {
    errors.push({ field: "endDate", message: "End date is required" });
  }

  if (input.startDate && input.endDate && input.startDate > input.endDate) {
    errors.push({
      field: "endDate",
      message: "End date must be after start date",
    });
  }

  return errors;
}

export function validateCreateMealPlanEntry(
  input: CreateMealPlanEntryInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.recipeId) {
    errors.push({ field: "recipeId", message: "Recipe is required" });
  }

  if (!input.date) {
    errors.push({ field: "date", message: "Date is required" });
  }

  if (!input.slot || !isValidSlot(input.slot)) {
    errors.push({
      field: "slot",
      message: `Slot must be one of: ${MEAL_SLOTS.join(", ")}`,
    });
  }

  if (input.servings !== undefined) {
    if (!Number.isInteger(input.servings) || input.servings < 1) {
      errors.push({
        field: "servings",
        message: "Servings must be at least 1",
      });
    } else if (input.servings > MAX_SERVINGS) {
      errors.push({
        field: "servings",
        message: `Servings must be at most ${MAX_SERVINGS}`,
      });
    }
  }

  return errors;
}

export function validateGenerateMealPlan(
  input: GenerateMealPlanInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.startDate) {
    errors.push({ field: "startDate", message: "Start date is required" });
  }

  if (!input.endDate) {
    errors.push({ field: "endDate", message: "End date is required" });
  }

  if (input.startDate && input.endDate && input.startDate > input.endDate) {
    errors.push({
      field: "endDate",
      message: "End date must be after start date",
    });
  }

  if (!input.slots || input.slots.length === 0) {
    errors.push({
      field: "slots",
      message: "At least one meal slot is required",
    });
  } else {
    for (const slot of input.slots) {
      if (!isValidSlot(slot)) {
        errors.push({
          field: "slots",
          message: `Invalid slot: ${slot}. Must be one of: ${MEAL_SLOTS.join(", ")}`,
        });
      }
    }
  }

  return errors;
}

import type { IngredientUnit } from "@personal-os/database";
import type { GroceryItem } from "./types.ts";

interface IngredientForAggregation {
  name: string;
  quantity: number;
  unit: IngredientUnit;
}

interface MealEntryForGrocery {
  servings: number;
  recipe: {
    title: string;
    servings: number;
    ingredients: IngredientForAggregation[];
  };
}

export function aggregateIngredients(
  entries: MealEntryForGrocery[],
): GroceryItem[] {
  const map = new Map<string, GroceryItem>();

  for (const entry of entries) {
    const scale = entry.servings / entry.recipe.servings;

    for (const ing of entry.recipe.ingredients) {
      const key = `${ing.name.toLowerCase().trim()}::${ing.unit}`;
      const existing = map.get(key);

      if (existing) {
        existing.quantity += ing.quantity * scale;
        if (!existing.recipes.includes(entry.recipe.title)) {
          existing.recipes.push(entry.recipe.title);
        }
      } else {
        map.set(key, {
          name: ing.name.trim(),
          quantity: ing.quantity * scale,
          unit: ing.unit,
          recipes: [entry.recipe.title],
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "fr"),
  );
}

export function scaleMacros(
  baseMacros: {
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  },
  baseServings: number,
  targetServings: number,
): {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
} {
  const ratio = targetServings / baseServings;
  return {
    calories: baseMacros.calories != null ? Math.round(baseMacros.calories * ratio) : null,
    protein: baseMacros.protein != null ? Math.round(baseMacros.protein * ratio) : null,
    carbs: baseMacros.carbs != null ? Math.round(baseMacros.carbs * ratio) : null,
    fat: baseMacros.fat != null ? Math.round(baseMacros.fat * ratio) : null,
  };
}

export function computeTotalTime(
  prepTime?: number | null,
  cookTime?: number | null,
): number | null {
  if (prepTime == null && cookTime == null) return null;
  return (prepTime ?? 0) + (cookTime ?? 0);
}

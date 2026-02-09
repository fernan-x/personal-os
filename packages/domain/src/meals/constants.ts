// ── Max lengths ──────────────────────────────────────────────

export const RECIPE_TITLE_MAX_LENGTH = 200;
export const RECIPE_DESCRIPTION_MAX_LENGTH = 2000;
export const SOURCE_URL_MAX_LENGTH = 500;
export const INGREDIENT_NAME_MAX_LENGTH = 100;
export const INSTRUCTION_CONTENT_MAX_LENGTH = 2000;
export const TAG_NAME_MAX_LENGTH = 50;
export const MEAL_PLAN_NAME_MAX_LENGTH = 100;

// ── Limits ───────────────────────────────────────────────────

export const MAX_INGREDIENTS = 50;
export const MAX_INSTRUCTIONS = 30;
export const MAX_TAGS = 10;
export const MAX_SERVINGS = 50;
export const MAX_TIME_MINUTES = 1440;

// ── Enum arrays ──────────────────────────────────────────────

export const RECIPE_VISIBILITIES = ["public", "private"] as const;
export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export const INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "piece",
  "tbsp",
  "tsp",
  "cup",
  "pinch",
] as const;

// ── French labels ────────────────────────────────────────────

export const VISIBILITY_LABELS: Record<string, string> = {
  public: "Public",
  private: "Privé",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

export const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Snack",
};

export const INGREDIENT_UNIT_LABELS: Record<string, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  piece: "pièce",
  tbsp: "c. à s.",
  tsp: "c. à c.",
  cup: "tasse",
  pinch: "pincée",
};

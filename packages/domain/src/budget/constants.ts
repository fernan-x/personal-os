export const GROUP_NAME_MAX_LENGTH = 100;
export const INCOME_SOURCE_MAX_LENGTH = 100;
export const EXPENSE_NAME_MAX_LENGTH = 150;
export const ENVELOPE_NOTE_MAX_LENGTH = 500;
export const CATEGORY_NAME_MAX_LENGTH = 50;
export const CATEGORY_ICON_MAX_LENGTH = 50;

export const EXPENSE_SCOPES = ["personal", "common"] as const;
export const EXPENSE_RECURRENCES = ["recurring", "exceptional"] as const;
export const EXPENSE_STATUSES = ["pending", "paid"] as const;

export const BASIS_POINTS_TOTAL = 10000;

export const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "utensils" },
  { name: "Transport", icon: "car" },
  { name: "Housing", icon: "home" },
  { name: "Utilities", icon: "bolt" },
  { name: "Healthcare", icon: "heart" },
  { name: "Entertainment", icon: "film" },
  { name: "Shopping", icon: "shopping-cart" },
  { name: "Savings", icon: "piggy-bank" },
  { name: "Other", icon: "ellipsis" },
] as const;

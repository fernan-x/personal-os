export const WIDGET_TYPES = [
  "habit_evolution",
  "habit_today",
  "budget_summary",
  "pet_today_activities",
  "pet_activities",
  "pet_weight_evolution",
] as const;

export const MAX_DASHBOARD_WIDGETS = 12;

export const WIDGET_TYPE_LABELS: Record<(typeof WIDGET_TYPES)[number], string> =
  {
    habit_evolution: "Évolution des habitudes",
    habit_today: "Habitudes du jour",
    budget_summary: "Résumé du budget",
    pet_today_activities: "Routines",
    pet_activities: "Activités",
    pet_weight_evolution: "Évolution du poids",
  };

export const WIDGET_TYPE_DESCRIPTIONS: Record<
  (typeof WIDGET_TYPES)[number],
  string
> = {
  habit_evolution:
    "Taux de complétion de vos habitudes sur la semaine ou le mois",
  habit_today: "Checklist des habitudes du jour",
  budget_summary: "Revenus, dépenses et épargne d'un groupe budgétaire",
  pet_today_activities: "Checklist des routines du jour pour un animal",
  pet_activities: "Activités enregistrées du jour avec navigation",
  pet_weight_evolution: "Courbe de poids d'un animal dans le temps",
};

// ── Modules ─────────────────────────────────────────────────

export const MODULES = ["habits", "budget", "pets"] as const;
export type ModuleId = (typeof MODULES)[number];

export interface ModuleDefinition {
  label: string;
  color: string;
}

// https://mantine.dev/theming/colors/#default-colors
export const MODULE_DEFINITIONS: Record<ModuleId, ModuleDefinition> = {
  habits: { label: "Habitudes", color: "teal" },
  budget: { label: "Budget", color: "grape" },
  pets: { label: "Animaux", color: "blue" },
};

export const WIDGET_MODULE_MAP: Record<
  (typeof WIDGET_TYPES)[number],
  ModuleId
> = {
  habit_evolution: "habits",
  habit_today: "habits",
  budget_summary: "budget",
  pet_today_activities: "pets",
  pet_activities: "pets",
  pet_weight_evolution: "pets",
};

// ── Widget sizes ────────────────────────────────────────────

/**
 * 12-column grid sizing.
 * SM  = 3 cols × 1 row    (4 per row)
 * M   = 6 cols × 1 row    (2 per row)
 * L   = 6 cols × 2 rows   (chart-friendly)
 * XL  = 12 cols × 2 rows  (full width)
 */
export type WidgetSize = "sm" | "m" | "l" | "xl";

export const WIDGET_SIZES: Record<(typeof WIDGET_TYPES)[number], WidgetSize> = {
  habit_evolution: "l",
  habit_today: "m",
  budget_summary: "m",
  pet_today_activities: "m",
  pet_activities: "m",
  pet_weight_evolution: "l",
};

export const WIDGET_SIZE_LABELS: Record<WidgetSize, string> = {
  sm: "S",
  m: "M",
  l: "L",
  xl: "XL",
};

export const WIDGET_TYPES = [
  "habit_evolution",
  "budget_summary",
  "pet_today_activities",
  "pet_activities",
  "pet_weight_evolution",
] as const;

export const MAX_DASHBOARD_WIDGETS = 12;

export const WIDGET_TYPE_LABELS: Record<
  (typeof WIDGET_TYPES)[number],
  string
> = {
  habit_evolution: "Évolution des habitudes",
  budget_summary: "Résumé du budget",
  pet_today_activities: "Routines",
  pet_activities: "Activités",
  pet_weight_evolution: "Évolution du poids",
};

export const WIDGET_TYPE_DESCRIPTIONS: Record<
  (typeof WIDGET_TYPES)[number],
  string
> = {
  habit_evolution: "Taux de complétion de vos habitudes sur la semaine ou le mois",
  budget_summary: "Revenus, dépenses et épargne d'un groupe budgétaire",
  pet_today_activities: "Checklist des routines du jour pour un animal",
  pet_activities: "Activités enregistrées du jour avec navigation",
  pet_weight_evolution: "Courbe de poids d'un animal dans le temps",
};

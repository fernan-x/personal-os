import type { WIDGET_TYPES } from "./constants.ts";

export type WidgetType = (typeof WIDGET_TYPES)[number];

// ── Per-widget config shapes ─────────────────────────────────

export interface HabitEvolutionConfig {
  period: "weekly" | "monthly";
}

export interface BudgetSummaryConfig {
  groupId: string;
}

export interface PetTodayActivitiesConfig {
  householdId: string;
  petId: string;
}

export interface PetActivitiesConfig {
  householdId: string;
  petId: string;
}

export interface PetWeightEvolutionConfig {
  householdId: string;
  petId: string;
}

export interface WidgetConfigMap {
  habit_evolution: HabitEvolutionConfig;
  budget_summary: BudgetSummaryConfig;
  pet_today_activities: PetTodayActivitiesConfig;
  pet_activities: PetActivitiesConfig;
  pet_weight_evolution: PetWeightEvolutionConfig;
}

// ── API DTOs ─────────────────────────────────────────────────

export interface DashboardWidgetDto {
  id: string;
  type: WidgetType;
  position: number;
  config: Record<string, unknown>;
}

export interface CreateDashboardWidgetInput {
  type: string;
  config: Record<string, unknown>;
}

export interface UpdateDashboardWidgetInput {
  config?: Record<string, unknown>;
}

export interface SetDashboardInput {
  widgets: Array<{
    id?: string;
    type: string;
    position: number;
    config: Record<string, unknown>;
  }>;
}

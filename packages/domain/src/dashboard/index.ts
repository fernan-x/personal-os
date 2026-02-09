export type {
  WidgetType,
  WidgetConfigMap,
  HabitEvolutionConfig,
  BudgetSummaryConfig,
  PetTodayActivitiesConfig,
  PetActivitiesConfig,
  PetWeightEvolutionConfig,
  DashboardWidgetDto,
  CreateDashboardWidgetInput,
  UpdateDashboardWidgetInput,
  SetDashboardInput,
} from "./types.ts";
export {
  WIDGET_TYPES,
  MAX_DASHBOARD_WIDGETS,
  WIDGET_TYPE_LABELS,
  WIDGET_TYPE_DESCRIPTIONS,
} from "./constants.ts";
export {
  isValidWidgetType,
  validateCreateDashboardWidget,
  validateSetDashboard,
  validateWidgetConfig,
} from "./validation.ts";

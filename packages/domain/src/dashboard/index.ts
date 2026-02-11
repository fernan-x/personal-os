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
  MODULES,
  MODULE_DEFINITIONS,
  WIDGET_MODULE_MAP,
  WIDGET_SIZES,
  WIDGET_SIZE_LABELS,
} from "./constants.ts";
export type { ModuleId, ModuleDefinition, WidgetSize } from "./constants.ts";
export {
  isValidWidgetType,
  validateCreateDashboardWidget,
  validateSetDashboard,
  validateWidgetConfig,
} from "./validation.ts";

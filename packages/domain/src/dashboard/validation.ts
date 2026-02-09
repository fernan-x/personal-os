import type { ValidationError } from "../common/index.ts";
import { WIDGET_TYPES, MAX_DASHBOARD_WIDGETS } from "./constants.ts";
import type {
  CreateDashboardWidgetInput,
  SetDashboardInput,
  WidgetType,
} from "./types.ts";

export function isValidWidgetType(value: string): value is WidgetType {
  return (WIDGET_TYPES as readonly string[]).includes(value);
}

export function validateWidgetConfig(
  type: WidgetType,
  config: Record<string, unknown>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (type) {
    case "habit_evolution": {
      if (
        config.period &&
        !["weekly", "monthly"].includes(config.period as string)
      ) {
        errors.push({
          field: "config.period",
          message: "Period must be 'weekly' or 'monthly'",
        });
      }
      break;
    }
    case "budget_summary": {
      if (!config.groupId || typeof config.groupId !== "string") {
        errors.push({
          field: "config.groupId",
          message: "Budget group ID is required",
        });
      }
      break;
    }
    case "pet_today_activities":
    case "pet_activities":
    case "pet_weight_evolution": {
      if (!config.householdId || typeof config.householdId !== "string") {
        errors.push({
          field: "config.householdId",
          message: "Household ID is required",
        });
      }
      if (!config.petId || typeof config.petId !== "string") {
        errors.push({
          field: "config.petId",
          message: "Pet ID is required",
        });
      }
      break;
    }
  }

  return errors;
}

export function validateCreateDashboardWidget(
  input: CreateDashboardWidgetInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.type) {
    errors.push({ field: "type", message: "Widget type is required" });
  } else if (!isValidWidgetType(input.type)) {
    errors.push({
      field: "type",
      message: `Widget type must be one of: ${WIDGET_TYPES.join(", ")}`,
    });
  } else {
    errors.push(...validateWidgetConfig(input.type, input.config ?? {}));
  }

  return errors;
}

export function validateSetDashboard(
  input: SetDashboardInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.widgets || !Array.isArray(input.widgets)) {
    errors.push({ field: "widgets", message: "Widgets array is required" });
    return errors;
  }

  if (input.widgets.length > MAX_DASHBOARD_WIDGETS) {
    errors.push({
      field: "widgets",
      message: `Maximum ${MAX_DASHBOARD_WIDGETS} widgets allowed`,
    });
  }

  for (let i = 0; i < input.widgets.length; i++) {
    const w = input.widgets[i];
    if (!isValidWidgetType(w.type)) {
      errors.push({
        field: `widgets[${i}].type`,
        message: `Invalid widget type: ${w.type}`,
      });
    } else {
      errors.push(
        ...validateWidgetConfig(w.type, w.config ?? {}).map((e) => ({
          ...e,
          field: `widgets[${i}].${e.field}`,
        })),
      );
    }
  }

  return errors;
}

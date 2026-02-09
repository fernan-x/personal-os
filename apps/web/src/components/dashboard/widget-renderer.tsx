import { Text } from "@mantine/core";
import type { DashboardWidgetDto } from "@personal-os/domain";
import { HabitEvolutionWidget } from "./widgets/habit-evolution-widget";
import { BudgetSummaryWidget } from "./widgets/budget-summary-widget";
import { PetTodayActivitiesWidget } from "./widgets/pet-today-activities-widget";
import { PetActivitiesWidget } from "./widgets/pet-activities-widget";
import { PetWeightEvolutionWidget } from "./widgets/pet-weight-evolution-widget";

export function WidgetRenderer({ widget }: { widget: DashboardWidgetDto }) {
  switch (widget.type) {
    case "habit_evolution":
      return <HabitEvolutionWidget config={widget.config} />;
    case "budget_summary":
      return <BudgetSummaryWidget config={widget.config} />;
    case "pet_today_activities":
      return <PetTodayActivitiesWidget config={widget.config} />;
    case "pet_activities":
      return <PetActivitiesWidget config={widget.config} />;
    case "pet_weight_evolution":
      return <PetWeightEvolutionWidget config={widget.config} />;
    default:
      return (
        <Text c="dimmed" size="sm">
          Widget inconnu
        </Text>
      );
  }
}

import { Card, Group, Text, Progress, ScrollArea, Stack } from "@mantine/core";
import { scaleMacros } from "@personal-os/domain";
import type { MacroTargets } from "@personal-os/domain";
import type { MealPlanDetail } from "../../hooks/use-meals";
import { MacrosDisplay } from "./macros-display";
import dayjs from "dayjs";
import "dayjs/locale/fr";

interface DailyMacroSummaryProps {
  plan: MealPlanDetail;
  dailyTargets: MacroTargets | null;
}

function getDatesArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getProgressColor(ratio: number): string {
  if (ratio >= 0.8 && ratio <= 1.1) return "teal";
  if ((ratio >= 0.6 && ratio < 0.8) || (ratio > 1.1 && ratio <= 1.3))
    return "orange";
  return "red";
}

export function DailyMacroSummary({
  plan,
  dailyTargets,
}: DailyMacroSummaryProps) {
  const planStartDate = (plan.startDate as unknown as string).slice(0, 10);
  const planEndDate = (plan.endDate as unknown as string).slice(0, 10);
  const dates = getDatesArray(planStartDate, planEndDate);

  // Group entries by date
  const entriesByDate = new Map<string, typeof plan.entries>();
  for (const entry of plan.entries) {
    const dateStr = (entry.date as unknown as string).slice(0, 10);
    const list = entriesByDate.get(dateStr) ?? [];
    list.push(entry);
    entriesByDate.set(dateStr, list);
  }

  return (
    <ScrollArea type="auto">
      <Group gap="sm" wrap="nowrap" pb="xs">
        {dates.map((dateStr) => {
          const entries = entriesByDate.get(dateStr) ?? [];

          // Sum macros for the day
          let totalCal = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;

          for (const entry of entries) {
            const scaled = scaleMacros(
              entry.recipe,
              entry.recipe.servings,
              entry.servings,
            );
            totalCal += scaled.calories ?? 0;
            totalProtein += scaled.protein ?? 0;
            totalCarbs += scaled.carbs ?? 0;
            totalFat += scaled.fat ?? 0;
          }

          const ratio = dailyTargets
            ? totalCal / dailyTargets.calories
            : null;

          return (
            <Card
              key={dateStr}
              withBorder
              padding="sm"
              radius="md"
              miw={140}
              style={{ flex: "0 0 auto" }}
            >
              <Stack gap={4}>
                <Text size="sm" fw={600}>
                  {dayjs(dateStr).locale("fr").format("ddd D")}
                </Text>

                <Text size="lg" fw={700}>
                  {totalCal} kcal
                </Text>

                {dailyTargets && ratio != null && (
                  <>
                    <Text size="xs" c="dimmed">
                      / {dailyTargets.calories} kcal
                    </Text>
                    <Progress
                      value={Math.min(ratio * 100, 100)}
                      color={getProgressColor(ratio)}
                      size="sm"
                    />
                  </>
                )}

                <MacrosDisplay
                  protein={totalProtein || null}
                  carbs={totalCarbs || null}
                  fat={totalFat || null}
                />
              </Stack>
            </Card>
          );
        })}
      </Group>
    </ScrollArea>
  );
}

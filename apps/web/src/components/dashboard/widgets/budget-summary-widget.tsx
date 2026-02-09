import { Text, Center, Loader, Group, Stack } from "@mantine/core";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMonthlyPlans, usePlanSummary } from "../../../hooks/use-budget";
import type { MonthlyPlan } from "@personal-os/domain";

interface Props {
  config: Record<string, unknown>;
}

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

function formatAmount(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function BudgetSummaryWidget({ config }: Props) {
  const groupId = config.groupId as string;
  const { data: plans, isLoading: plansLoading } = useMonthlyPlans(groupId || "");

  // Find current month's plan
  const now = new Date();
  const currentPlan = plans?.find(
    (p: MonthlyPlan) => p.month === now.getMonth() + 1 && p.year === now.getFullYear(),
  );
  const planId = currentPlan?.id || "";

  const { data: summary, isLoading: summaryLoading } = usePlanSummary(
    groupId || "",
    planId,
  );

  if (!groupId) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Configurez un groupe budgétaire
      </Text>
    );
  }

  if (plansLoading || summaryLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Aucun plan mensuel
      </Text>
    );
  }

  // Chart data: last 6 months from available plans
  const sortedPlans = [...plans]
    .sort((a: MonthlyPlan, b: MonthlyPlan) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .slice(-6);

  // We only have summary for current plan, so show summary stats + simplified chart
  return (
    <Stack gap="sm">
      {summary && (
        <Group justify="space-around">
          <div style={{ textAlign: "center" }}>
            <Text size="xs" c="dimmed">Revenus</Text>
            <Text size="sm" fw={600} c="teal">{formatAmount(summary.totalIncome)}</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Text size="xs" c="dimmed">Dépenses</Text>
            <Text size="sm" fw={600} c="red">{formatAmount(summary.totalExpenses)}</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Text size="xs" c="dimmed">Épargne</Text>
            <Text size="sm" fw={600} c="blue">{formatAmount(summary.totalSavings)}</Text>
          </div>
        </Group>
      )}
      {sortedPlans.length > 1 && (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={sortedPlans.map((p: MonthlyPlan) => ({
              name: `${MONTH_LABELS[p.month - 1]} ${p.year.toString().slice(-2)}`,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={30} />
            <Tooltip />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Stack>
  );
}

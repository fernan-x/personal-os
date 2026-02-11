import { Text, Center, Loader, SegmentedControl, Badge, Group } from "@mantine/core";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo, useState } from "react";
import { useHabitsSummary } from "../../../hooks/use-habits";

interface Props {
  config: Record<string, unknown>;
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getRange(period: "weekly" | "monthly"): { from: string; to: string } {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - (period === "weekly" ? 6 : 29));
  return { from: toDateKey(from), to: toDateKey(today) };
}

export function HabitEvolutionWidget({ config }: Props) {
  const [period, setPeriod] = useState<"weekly" | "monthly">(
    (config.period as "weekly" | "monthly") || "weekly",
  );

  const { from, to } = useMemo(() => getRange(period), [period]);
  const { data: summary, isLoading } = useHabitsSummary(from, to);

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.map((s) => {
      const d = new Date(s.date + "T12:00:00");
      return {
        date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        taux: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
      };
    });
  }, [summary]);

  const streak = useMemo(() => {
    if (!summary) return 0;
    let count = 0;
    // Walk backwards from today
    for (let i = summary.length - 1; i >= 0; i--) {
      const day = summary[i];
      if (day.total > 0 && day.completed === day.total) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [summary]);

  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!summary || summary.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Aucune donnée
      </Text>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Group justify="space-between" mb="sm">
        <SegmentedControl
          size="xs"
          value={period}
          onChange={(v) => setPeriod(v as "weekly" | "monthly")}
          data={[
            { label: "Semaine", value: "weekly" },
            { label: "Mois", value: "monthly" },
          ]}
        />
        {streak > 0 && (
          <Badge variant="light" color="teal" size="sm">
            {streak}j streak
          </Badge>
        )}
      </Group>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval={period === "monthly" ? 4 : 0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip formatter={(v) => [`${v}%`, "Taux"]} />
            <Area
              type="monotone"
              dataKey="taux"
              stroke="#12b886"
              fill="#12b886"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

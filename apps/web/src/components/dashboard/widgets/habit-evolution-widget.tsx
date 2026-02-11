import { Text, Center, Loader, SegmentedControl } from "@mantine/core";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { useHabits } from "../../../hooks/use-habits";

interface Props {
  config: Record<string, unknown>;
}

function getDateRange(period: "weekly" | "monthly"): Date[] {
  const days = period === "weekly" ? 7 : 30;
  const dates: Date[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

function toDateKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().split("T")[0];
}

export function HabitEvolutionWidget({ config }: Props) {
  const [period, setPeriod] = useState<"weekly" | "monthly">(
    (config.period as "weekly" | "monthly") || "weekly",
  );
  const { data: habits, isLoading } = useHabits();

  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Aucune habitude
      </Text>
    );
  }

  const dates = getDateRange(period);
  const totalHabits = habits.length;

  const chartData = dates.map((date) => {
    const dateKey = toDateKey(date);
    const completed = habits.filter((h) =>
      h.entries.some((e) => toDateKey(e.date) === dateKey && e.completed),
    ).length;
    return {
      date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      taux: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0,
    };
  });

  return (
    <div className="h-full flex flex-col">
      <SegmentedControl
        size="xs"
        mb="sm"
        value={period}
        onChange={(v) => setPeriod(v as "weekly" | "monthly")}
        data={[
          { label: "Semaine", value: "weekly" },
          { label: "Mois", value: "monthly" },
        ]}
      />
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

import { Text, Center, Loader, Group, Badge } from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useWeightEntries } from "../../../hooks/use-puppy";
import type { WeightEntry } from "@personal-os/domain";

interface Props {
  config: Record<string, unknown>;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams} g`;
}

export function PetWeightEvolutionWidget({ config }: Props) {
  const householdId = config.householdId as string;
  const petId = config.petId as string;
  const { data: entries, isLoading } = useWeightEntries(
    householdId || "",
    petId || "",
  );

  if (!householdId || !petId) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Configurez un animal
      </Text>
    );
  }

  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Pas de données de poids
      </Text>
    );
  }

  const sorted = [...entries].sort(
    (a: WeightEntry, b: WeightEntry) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const delta = previous ? latest.weight - previous.weight : null;

  const chartData = sorted.map((e: WeightEntry) => ({
    date: new Date(e.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    poids: e.weight / 1000,
  }));

  return (
    <div className="h-full flex flex-col">
      <Group justify="center" mb="sm" gap="xs">
        <Text size="sm" fw={600}>
          {formatWeight(latest.weight)}
        </Text>
        {delta !== null && (
          <Badge
            variant="light"
            color={delta >= 0 ? "teal" : "red"}
            size="xs"
          >
            {delta >= 0 ? "+" : ""}
            {formatWeight(delta)}
          </Badge>
        )}
      </Group>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}kg`}
              width={40}
            />
            <Tooltip formatter={(v) => [`${v} kg`, "Poids"]} />
            <Line
              type="monotone"
              dataKey="poids"
              stroke="#228be6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

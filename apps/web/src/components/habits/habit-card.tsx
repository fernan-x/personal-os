import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Checkbox,
  ActionIcon,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { HabitWithEntries } from "../../hooks/use-habits";
import { useLogHabitEntry } from "../../hooks/use-habits";
import type { HabitFrequency } from "@personal-os/domain";
import { FREQUENCY_LABELS_FR, DAY_LABELS_SHORT_FR } from "../../lib/labels";

const frequencyColor: Record<HabitFrequency, string> = {
  daily: "blue",
  weekly: "grape",
  custom: "orange",
};

interface HabitCardProps {
  habit: HabitWithEntries;
  date: string;
  onEdit: () => void;
  isOffDay?: boolean;
}

export function HabitCard({ habit, date, onEdit, isOffDay }: HabitCardProps) {
  const logEntry = useLogHabitEntry();

  const todayEntry = habit.entries[0];
  const isCompleted = todayEntry?.completed ?? false;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const isToday = date === today.toISOString().split("T")[0];

  function handleToggle() {
    logEntry.mutate({
      habitId: habit.id,
      date: date + "T00:00:00.000Z",
      completed: !isCompleted,
    });
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder opacity={isOffDay ? 0.5 : 1}>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Text fw={600} size="lg">
              {habit.name}
            </Text>
            <Badge color={frequencyColor[habit.frequency]} variant="light" size="sm">
              {habit.frequency === "custom" && habit.customDays?.length
                ? habit.customDays.map((d) => DAY_LABELS_SHORT_FR[d]).join(", ")
                : FREQUENCY_LABELS_FR[habit.frequency] ?? habit.frequency}
            </Badge>
          </Group>
          <ActionIcon variant="subtle" size="sm" onClick={onEdit}>
            <IconPencil size={16} />
          </ActionIcon>
        </Group>

        {habit.description && (
          <Text c="dimmed" size="sm" lineClamp={2}>
            {habit.description}
          </Text>
        )}

        <Checkbox
          label={isToday ? "Fait aujourd'hui" : "Fait"}
          checked={isCompleted}
          onChange={handleToggle}
          disabled={logEntry.isPending}
        />
      </Stack>
    </Card>
  );
}

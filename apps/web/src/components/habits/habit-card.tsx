import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Checkbox,
  ActionIcon,
} from "@mantine/core";
import type { HabitWithEntries } from "../../hooks/use-habits";
import { useLogHabitEntry } from "../../hooks/use-habits";
import type { HabitFrequency } from "@personal-os/domain";

const frequencyColor: Record<HabitFrequency, string> = {
  daily: "blue",
  weekly: "grape",
  custom: "orange",
};

interface HabitCardProps {
  habit: HabitWithEntries;
  onEdit: () => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const logEntry = useLogHabitEntry();

  const todayEntry = habit.entries[0];
  const isCompletedToday = todayEntry?.completed ?? false;

  function handleToggle() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    logEntry.mutate({
      habitId: habit.id,
      date: today.toISOString(),
      completed: !isCompletedToday,
    });
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Text fw={600} size="lg">
              {habit.name}
            </Text>
            <Badge color={frequencyColor[habit.frequency]} variant="light" size="sm">
              {habit.frequency}
            </Badge>
          </Group>
          <ActionIcon variant="subtle" size="sm" onClick={onEdit}>
            <Text size="xs">Edit</Text>
          </ActionIcon>
        </Group>

        {habit.description && (
          <Text c="dimmed" size="sm" lineClamp={2}>
            {habit.description}
          </Text>
        )}

        <Checkbox
          label="Done today"
          checked={isCompletedToday}
          onChange={handleToggle}
          disabled={logEntry.isPending}
        />
      </Stack>
    </Card>
  );
}

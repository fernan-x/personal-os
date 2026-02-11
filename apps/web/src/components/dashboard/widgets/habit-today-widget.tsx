import { Text, Center, Loader, Group, Stack, Badge, Checkbox } from "@mantine/core";
import { useHabits, useLogHabitEntry } from "../../../hooks/use-habits";
import type { HabitWithEntries } from "../../../hooks/use-habits";

interface Props {
  config: Record<string, unknown>;
}

function isOffDay(habit: HabitWithEntries): boolean {
  if (habit.frequency !== "custom" || !habit.customDays?.length) return false;
  const jsDay = new Date().getDay(); // 0=Sun … 6=Sat
  const isoDay = jsDay === 0 ? 7 : jsDay;
  return !habit.customDays.includes(isoDay);
}

export function HabitTodayWidget({ config: _config }: Props) {
  const { data: habits, isLoading } = useHabits();
  const logEntry = useLogHabitEntry();

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

  const activeHabits = habits.filter((h) => !isOffDay(h));
  const offDayHabits = habits.filter((h) => isOffDay(h));
  const completed = activeHabits.filter((h) => h.entries[0]?.completed).length;
  const total = activeHabits.length;

  function handleToggle(habitId: string, currentlyCompleted: boolean) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    logEntry.mutate({
      habitId,
      date: today.toISOString(),
      completed: !currentlyCompleted,
    });
  }

  return (
    <Stack gap="xs" className="h-full">
      <Group justify="space-between">
        <Text size="sm" fw={500}>Aujourd'hui</Text>
        <Badge
          variant="light"
          color={completed === total ? "teal" : "gray"}
          size="sm"
        >
          {completed}/{total}
        </Badge>
      </Group>
      <div className="flex-1 overflow-y-auto">
        <Stack gap="xs">
          {activeHabits.map((habit) => {
            const isCompleted = habit.entries[0]?.completed ?? false;
            return (
              <Checkbox
                key={habit.id}
                label={habit.name}
                checked={isCompleted}
                onChange={() => handleToggle(habit.id, isCompleted)}
                disabled={logEntry.isPending}
                size="sm"
              />
            );
          })}
          {offDayHabits.map((habit) => {
            const isCompleted = habit.entries[0]?.completed ?? false;
            return (
              <Checkbox
                key={habit.id}
                label={habit.name}
                checked={isCompleted}
                onChange={() => handleToggle(habit.id, isCompleted)}
                disabled={logEntry.isPending}
                size="sm"
                opacity={0.5}
              />
            );
          })}
        </Stack>
      </div>
    </Stack>
  );
}

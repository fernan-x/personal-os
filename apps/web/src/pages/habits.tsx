import { useState } from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  SimpleGrid,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Habit } from "@personal-os/domain";
import { useHabits } from "../hooks/use-habits";
import { HabitCard } from "../components/habits/habit-card";
import { CreateHabitModal } from "../components/habits/create-habit-modal";
import { EditHabitModal } from "../components/habits/edit-habit-modal";

export function HabitsPage() {
  const { data: habits, isLoading, error } = useHabits();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title>Habits</Title>
          <Text c="dimmed">Track and build your daily habits.</Text>
        </div>
        <Button onClick={openCreate}>New Habit</Button>
      </Group>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && (
        <Alert color="red" title="Error loading habits">
          {error.message}
        </Alert>
      )}

      {habits && habits.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No habits yet. Create your first habit to get started!
        </Text>
      )}

      {habits && habits.length > 0 && (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="md"
        >
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => setEditingHabit(habit)}
            />
          ))}
        </SimpleGrid>
      )}

      <CreateHabitModal opened={createOpened} onClose={closeCreate} />
      <EditHabitModal
        habit={editingHabit}
        opened={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
      />
    </Stack>
  );
}

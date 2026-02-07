import { useState } from "react";
import {
  Stack,
  Button,
  SimpleGrid,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTargetArrow, IconPlus } from "@tabler/icons-react";
import type { Habit } from "@personal-os/domain";
import { useHabits } from "../hooks/use-habits";
import { HabitCard } from "../components/habits/habit-card";
import { CreateHabitModal } from "../components/habits/create-habit-modal";
import { EditHabitModal } from "../components/habits/edit-habit-modal";
import { PageHeader } from "../components/shared/page-header";
import { EmptyState } from "../components/shared/empty-state";

export function HabitsPage() {
  const { data: habits, isLoading, error } = useHabits();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  return (
    <Stack>
      <PageHeader
        icon={IconTargetArrow}
        title="Habitudes"
        subtitle="Suivez vos habitudes quotidiennes"
        actions={<Button leftSection={<IconPlus size={16} />} onClick={openCreate}>Nouvelle habitude</Button>}
      />

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && (
        <Alert color="red" title="Erreur de chargement">
          {error.message}
        </Alert>
      )}

      {habits && habits.length === 0 && (
        <EmptyState
          icon={IconTargetArrow}
          title="Aucune habitude"
          description="Commencez par créer votre première habitude quotidienne."
          actionLabel="Nouvelle habitude"
          onAction={openCreate}
        />
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

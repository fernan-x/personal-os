import { useState } from "react";
import {
  Stack,
  Button,
  SimpleGrid,
  Alert,
  Loader,
  Center,
  Group,
  Text,
  ActionIcon,
  SegmentedControl,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconTargetArrow,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import type { Habit } from "@personal-os/domain";
import type { HabitWithEntries } from "../hooks/use-habits";
import { useHabitsByDate } from "../hooks/use-habits";
import { HabitCard } from "../components/habits/habit-card";
import { CreateHabitModal } from "../components/habits/create-habit-modal";
import { EditHabitModal } from "../components/habits/edit-habit-modal";
import { HabitCalendar } from "../components/habits/habit-calendar";
import { PageHeader } from "../components/shared/page-header";
import { EmptyState } from "../components/shared/empty-state";

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getIsoWeekday(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const js = d.getDay(); // 0=Sun … 6=Sat
  return js === 0 ? 7 : js;
}

function isHabitOffDay(habit: HabitWithEntries, dateStr: string): boolean {
  if (habit.frequency !== "custom" || !habit.customDays?.length) return false;
  return !habit.customDays.includes(getIsoWeekday(dateStr));
}

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function HabitsPage() {
  const todayKey = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [view, setView] = useState<"list" | "calendar">("list");

  const { data: habits, isLoading, error } = useHabitsByDate(selectedDate);
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const isToday = selectedDate === todayKey;

  function goToPreviousDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateKey(d));
  }

  function goToNextDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(toDateKey(d));
  }

  function goToToday() {
    setSelectedDate(todayKey);
  }

  function handleCalendarSelect(date: string) {
    setSelectedDate(date);
    setView("list");
  }

  return (
    <Stack>
      <PageHeader
        icon={IconTargetArrow}
        title="Habitudes"
        subtitle="Suivez vos habitudes quotidiennes"
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreate}
          >
            Nouvelle habitude
          </Button>
        }
      />

      <Group justify="center">
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as "list" | "calendar")}
          data={[
            { label: "Liste", value: "list" },
            { label: "Calendrier", value: "calendar" },
          ]}
        />
      </Group>

      {view === "list" ? (
        <>
          {/* Date navigation */}
          <Group justify="center" gap="sm">
            <ActionIcon variant="subtle" onClick={goToPreviousDay}>
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Text fw={600} size="lg" tt="capitalize" style={{ minWidth: 260, textAlign: "center" }}>
              {formatDateFr(selectedDate)}
            </Text>
            <ActionIcon
              variant="subtle"
              onClick={goToNextDay}
              disabled={isToday}
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          </Group>

          {!isToday && (
            <Group justify="center">
              <Button variant="subtle" size="xs" onClick={goToToday}>
                Aujourd'hui
              </Button>
            </Group>
          )}

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
              {[...habits]
                .sort((a, b) => {
                  const aOff = isHabitOffDay(a, selectedDate) ? 1 : 0;
                  const bOff = isHabitOffDay(b, selectedDate) ? 1 : 0;
                  return aOff - bOff;
                })
                .map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    date={selectedDate}
                    onEdit={() => setEditingHabit(habit)}
                    isOffDay={isHabitOffDay(habit, selectedDate)}
                  />
                ))}
            </SimpleGrid>
          )}
        </>
      ) : (
        <HabitCalendar onSelectDate={handleCalendarSelect} />
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

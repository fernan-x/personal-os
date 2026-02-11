import {
  ActionIcon,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { useHabitsSummary } from "../../hooks/use-habits";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatMonth(date: Date): string {
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getUTCDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (Date | null)[] = [];

  // Padding before
  for (let i = 0; i < startDow; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    days.push(new Date(Date.UTC(year, month, d)));
  }

  return days;
}

interface HabitCalendarProps {
  onSelectDate: (date: string) => void;
}

export function HabitCalendar({ onSelectDate }: HabitCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = toDateKey(new Date(Date.UTC(year, month, 1)));
  const lastOfMonth = toDateKey(new Date(Date.UTC(year, month + 1, 0)));

  const { data: summary, isLoading } = useHabitsSummary(
    firstOfMonth,
    lastOfMonth,
  );

  const summaryMap = new Map(
    (summary ?? []).map((s) => [s.date, s]),
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const days = getMonthDays(year, month);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function getColor(dateKey: string): string | null {
    if (dateKey > todayKey) return null; // future
    const entry = summaryMap.get(dateKey);
    if (!entry || entry.total === 0) return "var(--mantine-color-gray-3)";
    const rate = entry.completed / entry.total;
    if (rate >= 1) return "var(--mantine-color-teal-6)";
    if (rate > 0) return "var(--mantine-color-yellow-5)";
    return "var(--mantine-color-gray-3)";
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <ActionIcon variant="subtle" onClick={prevMonth}>
          <IconChevronLeft size={18} />
        </ActionIcon>
        <Text fw={600} tt="capitalize">
          {formatMonth(new Date(year, month))}
        </Text>
        <ActionIcon variant="subtle" onClick={nextMonth}>
          <IconChevronRight size={18} />
        </ActionIcon>
      </Group>

      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : (
        <>
          <SimpleGrid cols={7} spacing={4} mb={4}>
            {DAY_LABELS.map((label) => (
              <Text key={label} size="xs" fw={600} ta="center" c="dimmed">
                {label}
              </Text>
            ))}
          </SimpleGrid>

          <SimpleGrid cols={7} spacing={4}>
            {days.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} />;
              }
              const dateKey = toDateKey(day);
              const color = getColor(dateKey);
              const isCurrentDay = dateKey === todayKey;

              return (
                <UnstyledButton
                  key={dateKey}
                  onClick={() => onSelectDate(dateKey)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "var(--mantine-radius-sm)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: isCurrentDay
                      ? "2px solid var(--mantine-color-teal-6)"
                      : "1px solid var(--mantine-color-gray-2)",
                  }}
                >
                  <Text size="sm" fw={isCurrentDay ? 700 : 400}>
                    {day.getUTCDate()}
                  </Text>
                  {color && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: color,
                        marginTop: 2,
                      }}
                    />
                  )}
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </>
      )}
    </div>
  );
}

import { Box, Text, ActionIcon, Table, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { MEAL_SLOT_LABELS } from "@personal-os/domain";
import type { MealSlot } from "@personal-os/domain";
import { MealPlanEntryCard } from "./meal-plan-entry-card";
import type { MealPlanDetail, MealPlanEntryDetail } from "../../hooks/use-meals";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface MealPlanGridProps {
  plan: MealPlanDetail;
  onAddRecipe: (date: string, slot: MealSlot) => void;
  onDeleteEntry: (entryId: string) => void;
  onEntryClick: (entry: MealPlanEntryDetail) => void;
}

function getDatesArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDayHeader(dateStr: string, index: number): string {
  const date = new Date(dateStr);
  const dayLabel = DAY_LABELS[index % 7] ?? "";
  return `${dayLabel} ${date.getDate()}`;
}

export function MealPlanGrid({
  plan,
  onAddRecipe,
  onDeleteEntry,
  onEntryClick,
}: MealPlanGridProps) {
  const dates = getDatesArray(
    plan.startDate as unknown as string,
    plan.endDate as unknown as string,
  );

  // Build lookup: "YYYY-MM-DD::slot" → entries[]
  const entryMap = new Map<string, MealPlanEntryDetail[]>();
  for (const entry of plan.entries) {
    const dateStr = (entry.date as unknown as string).slice(0, 10);
    const key = `${dateStr}::${entry.slot}`;
    const list = entryMap.get(key) ?? [];
    list.push(entry);
    entryMap.set(key, list);
  }

  return (
    <Box style={{ overflowX: "auto" }}>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 120, minWidth: 120 }} />
            {dates.map((dateStr, i) => (
              <Table.Th
                key={dateStr}
                style={{ minWidth: 140, textAlign: "center" }}
              >
                <Text size="sm" fw={600}>
                  {formatDayHeader(dateStr, i)}
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {SLOTS.map((slot) => (
            <Table.Tr key={slot}>
              <Table.Td
                style={{
                  width: 120,
                  minWidth: 120,
                  verticalAlign: "top",
                  fontWeight: 600,
                }}
              >
                <Text size="sm" fw={600}>
                  {MEAL_SLOT_LABELS[slot]}
                </Text>
              </Table.Td>
              {dates.map((dateStr) => {
                const entries = entryMap.get(`${dateStr}::${slot}`) ?? [];
                return (
                  <Table.Td
                    key={`${dateStr}-${slot}`}
                    style={{
                      minWidth: 140,
                      verticalAlign: "top",
                      padding: 4,
                    }}
                  >
                    <Stack gap={4}>
                      {entries.map((entry) => (
                        <MealPlanEntryCard
                          key={entry.id}
                          entry={entry}
                          onDelete={() => onDeleteEntry(entry.id)}
                          onClick={() => onEntryClick(entry)}
                        />
                      ))}
                      <ActionIcon
                        variant="light"
                        color="gray"
                        size="lg"
                        style={{
                          width: "100%",
                          minHeight: 40,
                        }}
                        onClick={() => onAddRecipe(dateStr, slot)}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Stack>
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

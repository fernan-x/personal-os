import { useState } from "react";
import { Box, Text, ActionIcon, Table, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
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
  onMoveEntry?: (entryId: string, date: string, slot: MealSlot) => void;
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

function DroppableCell({
  id,
  isOver,
  children,
}: {
  id: string;
  isOver?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver: over } = useDroppable({ id });
  const highlighted = isOver ?? over;

  return (
    <Table.Td
      ref={setNodeRef}
      style={{
        minWidth: 140,
        verticalAlign: "top",
        padding: 4,
        outline: highlighted ? "2px solid var(--mantine-color-blue-4)" : undefined,
        backgroundColor: highlighted ? "var(--mantine-color-blue-0)" : undefined,
        transition: "outline 150ms, background-color 150ms",
      }}
    >
      {children}
    </Table.Td>
  );
}

function DraggableEntry({
  entry,
  isDragging,
  onDelete,
  onClick,
}: {
  entry: MealPlanEntryDetail;
  isDragging: boolean;
  onDelete: () => void;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: entry.id,
    data: entry,
  });

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <MealPlanEntryCard
        entry={entry}
        onDelete={onDelete}
        onClick={onClick}
      />
    </Box>
  );
}

export function MealPlanGrid({
  plan,
  onAddRecipe,
  onDeleteEntry,
  onEntryClick,
  onMoveEntry,
}: MealPlanGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

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

  const activeEntry = activeId
    ? plan.entries.find((e) => e.id === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !onMoveEntry) return;

    const entryId = active.id as string;
    const targetId = over.id as string;
    if (!targetId.includes("::")) return;

    const [date, slot] = targetId.split("::");

    // Don't move if dropped on the same cell
    const entry = plan.entries.find((e) => e.id === entryId);
    if (entry) {
      const entryDate = (entry.date as unknown as string).slice(0, 10);
      if (entryDate === date && entry.slot === slot) return;
    }

    onMoveEntry(entryId, date, slot as MealSlot);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
                  const cellId = `${dateStr}::${slot}`;
                  const entries = entryMap.get(cellId) ?? [];
                  return (
                    <DroppableCell key={cellId} id={cellId}>
                      <Stack gap={4}>
                        {entries.map((entry) => (
                          <DraggableEntry
                            key={entry.id}
                            entry={entry}
                            isDragging={activeId === entry.id}
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
                    </DroppableCell>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
      <DragOverlay>
        {activeEntry && (
          <Box style={{ width: 140, opacity: 0.85 }}>
            <MealPlanEntryCard
              entry={activeEntry}
              onDelete={() => {}}
              onClick={() => {}}
            />
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}

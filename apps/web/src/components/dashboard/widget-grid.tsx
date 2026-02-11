import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { Card, Group, Text, ActionIcon } from "@mantine/core";
import {
  IconGripVertical,
  IconSettings,
  IconTrash,
  IconTargetArrow,
  IconWallet,
  IconPaw,
} from "@tabler/icons-react";
import {
  WIDGET_SIZES,
  WIDGET_TYPE_LABELS,
  WIDGET_MODULE_MAP,
  MODULE_DEFINITIONS,
} from "@personal-os/domain";
import type {
  DashboardWidgetDto,
  WidgetType,
  WidgetSize,
  ModuleId,
} from "@personal-os/domain";
import { WidgetShell } from "./widget-shell";
import type { ComponentType } from "react";

interface Props {
  widgets: DashboardWidgetDto[];
  editMode: boolean;
  onReorder: (widgets: DashboardWidgetDto[]) => void;
  onRemove: (id: string) => void;
  onConfigure: (widget: DashboardWidgetDto) => void;
}

const MODULE_ICONS: Record<
  ModuleId,
  ComponentType<{ size: number; stroke: number; color?: string }>
> = {
  habits: IconTargetArrow,
  budget: IconWallet,
  pets: IconPaw,
};

function getSize(widget: DashboardWidgetDto): WidgetSize {
  return WIDGET_SIZES[widget.type as WidgetType] ?? "sm";
}

/*
 * Responsive Tailwind classes for a 6-col (mobile) / 12-col (md+) grid.
 *
 *        mobile (6 cols)        desktop (12 cols)
 * SM     col-span-3  (½)       col-span-3  (¼)
 * M      col-span-6  (full)    col-span-6  (½)
 * L      col-span-6  (full)    col-span-6  (½)   + row-span-2
 * XL     col-span-6  (full)    col-span-12 (full) + row-span-2
 */
const SIZE_CLASSES: Record<WidgetSize, string> = {
  sm: "col-span-3",
  m: "col-span-6",
  l: "col-span-6 row-span-2",
  xl: "col-span-6 md:col-span-12 row-span-2",
};

/* ── Edit-mode card (simplified, no charts) ─────────────── */

function EditCard({
  widget,
  onRemove,
  onConfigure,
  dragAttributes,
  dragListeners,
  isDragOverlay,
}: {
  widget: DashboardWidgetDto;
  onRemove?: () => void;
  onConfigure?: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  isDragOverlay?: boolean;
}) {
  const label = WIDGET_TYPE_LABELS[widget.type as WidgetType] ?? widget.type;
  const moduleId = WIDGET_MODULE_MAP[widget.type as WidgetType];
  const moduleDef = moduleId ? MODULE_DEFINITIONS[moduleId] : undefined;
  const moduleColor = moduleDef?.color ?? "gray";
  const ModuleIcon = moduleId ? MODULE_ICONS[moduleId] : null;

  return (
    <Card
      shadow={isDragOverlay ? "md" : "sm"}
      padding="md"
      radius="md"
      withBorder
      className="h-full flex flex-col justify-center"
      style={{ opacity: isDragOverlay ? 0.9 : 1 }}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            style={{ cursor: isDragOverlay ? "grabbing" : "grab" }}
            {...dragAttributes}
            {...dragListeners}
          >
            <IconGripVertical size={16} />
          </ActionIcon>
          {ModuleIcon && (
            <ModuleIcon
              size={16}
              stroke={1.5}
              color={`var(--mantine-color-${moduleColor}-5)`}
            />
          )}
          <Text fw={500} size="sm">
            {label}
          </Text>
        </Group>
        {!isDragOverlay && (
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onConfigure}
            >
              <IconSettings size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={onRemove}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Card>
  );
}

/* ── Sortable wrapper (edit mode) ───────────────────────── */

function SortableEditWidget({
  widget,
  onRemove,
  onConfigure,
  isDragging,
}: {
  widget: DashboardWidgetDto;
  onRemove: () => void;
  onConfigure: () => void;
  isDragging: boolean;
}) {
  const size = getSize(widget);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: widget.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className={SIZE_CLASSES[size]}
        style={{
          ...style,
          opacity: 0.3,
          border: "2px dashed var(--mantine-color-gray-4)",
          borderRadius: "var(--mantine-radius-md)",
        }}
      />
    );
  }

  return (
    <div ref={setNodeRef} className={SIZE_CLASSES[size]} style={style}>
      <EditCard
        widget={widget}
        onRemove={onRemove}
        onConfigure={onConfigure}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

/* ── Main grid ──────────────────────────────────────────── */

export function WidgetGrid({
  widgets,
  editMode,
  onReorder,
  onRemove,
  onConfigure,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(widgets, oldIndex, newIndex);
      onReorder(reordered.map((w, i) => ({ ...w, position: i })));
    },
    [widgets, onReorder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeWidget = activeId
    ? widgets.find((w) => w.id === activeId)
    : null;

  // ── View mode: no DnD, render full widgets ──
  if (!editMode) {
    return (
      <div
        className="grid grid-cols-6 md:grid-cols-12 gap-4"
        style={{ gridAutoRows: "180px", gridAutoFlow: "dense" }}
      >
        {widgets.map((widget) => {
          const size = getSize(widget);
          return (
            <div key={widget.id} className={SIZE_CLASSES[size]}>
              <WidgetShell widget={widget} editMode={false} />
            </div>
          );
        })}
      </div>
    );
  }

  // ── Edit mode: DnD with simplified cards + overlay ──
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={widgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="grid grid-cols-6 md:grid-cols-12 gap-4"
          style={{ gridAutoRows: "180px", gridAutoFlow: "dense" }}
        >
          {widgets.map((widget) => (
            <SortableEditWidget
              key={widget.id}
              widget={widget}
              isDragging={widget.id === activeId}
              onRemove={() => onRemove(widget.id)}
              onConfigure={() => onConfigure(widget)}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeWidget ? (
          <div style={{ height: 180 }}>
            <EditCard widget={activeWidget} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

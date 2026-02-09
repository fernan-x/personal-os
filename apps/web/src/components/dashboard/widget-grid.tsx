import { SimpleGrid } from "@mantine/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DashboardWidgetDto } from "@personal-os/domain";
import { WidgetShell } from "./widget-shell";

interface Props {
  widgets: DashboardWidgetDto[];
  editMode: boolean;
  onReorder: (widgets: DashboardWidgetDto[]) => void;
  onRemove: (id: string) => void;
  onConfigure: (widget: DashboardWidgetDto) => void;
}

function SortableWidget({
  widget,
  editMode,
  onRemove,
  onConfigure,
}: {
  widget: DashboardWidgetDto;
  editMode: boolean;
  onRemove: () => void;
  onConfigure: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WidgetShell
        widget={widget}
        editMode={editMode}
        onRemove={onRemove}
        onConfigure={onConfigure}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

export function WidgetGrid({
  widgets,
  editMode,
  onReorder,
  onRemove,
  onConfigure,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...widgets];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(
      reordered.map((w, i) => ({ ...w, position: i })),
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={widgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
      >
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              editMode={editMode}
              onRemove={() => onRemove(widget.id)}
              onConfigure={() => onConfigure(widget)}
            />
          ))}
        </SimpleGrid>
      </SortableContext>
    </DndContext>
  );
}

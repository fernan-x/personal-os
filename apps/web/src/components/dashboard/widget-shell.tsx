import { Card, Group, Text, ActionIcon } from "@mantine/core";
import {
  IconGripVertical,
  IconSettings,
  IconTrash,
  IconTargetArrow,
  IconWallet,
  IconPaw,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import {
  WIDGET_TYPE_LABELS,
  WIDGET_MODULE_MAP,
  MODULE_DEFINITIONS,
} from "@personal-os/domain";
import type { DashboardWidgetDto, WidgetType, ModuleId } from "@personal-os/domain";
import { WidgetRenderer } from "./widget-renderer";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { ComponentType } from "react";

const MODULE_ICONS: Record<ModuleId, ComponentType<{ size: number; stroke: number; color?: string }>> = {
  habits: IconTargetArrow,
  budget: IconWallet,
  pets: IconPaw,
  meals: IconToolsKitchen2,
};

interface Props {
  widget: DashboardWidgetDto;
  editMode: boolean;
  onConfigure?: () => void;
  onRemove?: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
}

export function WidgetShell({
  widget,
  editMode,
  onConfigure,
  onRemove,
  dragAttributes,
  dragListeners,
}: Props) {
  const label =
    WIDGET_TYPE_LABELS[widget.type as WidgetType] ?? widget.type;
  const moduleId = WIDGET_MODULE_MAP[widget.type as WidgetType];
  const moduleDef = moduleId ? MODULE_DEFINITIONS[moduleId] : undefined;
  const moduleColor = moduleDef?.color ?? "gray";
  const ModuleIcon = moduleId ? MODULE_ICONS[moduleId] : null;

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      className="h-full flex flex-col"
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          {editMode && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              style={{ cursor: "grab" }}
              {...dragAttributes}
              {...dragListeners}
            >
              <IconGripVertical size={16} />
            </ActionIcon>
          )}
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
        {editMode && (
          <Group gap={4}>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onConfigure}>
              <IconSettings size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <WidgetRenderer widget={widget} />
      </div>
    </Card>
  );
}

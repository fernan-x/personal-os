import { Card, Group, Text, ActionIcon } from "@mantine/core";
import { IconGripVertical, IconSettings, IconTrash } from "@tabler/icons-react";
import { WIDGET_TYPE_LABELS } from "@personal-os/domain";
import type { DashboardWidgetDto, WidgetType } from "@personal-os/domain";
import { WidgetRenderer } from "./widget-renderer";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { CSSProperties } from "react";

interface Props {
  widget: DashboardWidgetDto;
  editMode: boolean;
  onConfigure?: () => void;
  onRemove?: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  style?: CSSProperties;
}

export function WidgetShell({
  widget,
  editMode,
  onConfigure,
  onRemove,
  dragAttributes,
  dragListeners,
  style,
}: Props) {
  const label =
    WIDGET_TYPE_LABELS[widget.type as WidgetType] ?? widget.type;

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={style}>
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
      <WidgetRenderer widget={widget} />
    </Card>
  );
}

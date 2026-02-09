import { Drawer, Stack, Card, Group, Text, Button, ThemeIcon } from "@mantine/core";
import {
  IconTargetArrow,
  IconWallet,
  IconPaw,
  IconActivity,
  IconScale,
} from "@tabler/icons-react";
import {
  WIDGET_TYPES,
  WIDGET_TYPE_LABELS,
  WIDGET_TYPE_DESCRIPTIONS,
} from "@personal-os/domain";
import type { WidgetType } from "@personal-os/domain";
import type { ComponentType } from "react";

interface Props {
  opened: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
}

const WIDGET_ICONS: Record<WidgetType, ComponentType<{ size: number; stroke: number }>> = {
  habit_evolution: IconTargetArrow,
  budget_summary: IconWallet,
  pet_today_activities: IconPaw,
  pet_activities: IconActivity,
  pet_weight_evolution: IconScale,
};

const WIDGET_COLORS: Record<WidgetType, string> = {
  habit_evolution: "teal",
  budget_summary: "amber",
  pet_today_activities: "blue",
  pet_activities: "violet",
  pet_weight_evolution: "cyan",
};

export function EditModeDrawer({ opened, onClose, onAdd }: Props) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Ajouter un widget"
      position="right"
      size="sm"
    >
      <Stack>
        {WIDGET_TYPES.map((type) => {
          const Icon = WIDGET_ICONS[type];
          return (
            <Card key={type} withBorder padding="sm">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" style={{ flex: 1 }}>
                  <ThemeIcon
                    variant="light"
                    color={WIDGET_COLORS[type]}
                    size="lg"
                    radius="md"
                  >
                    <Icon size={20} stroke={1.5} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {WIDGET_TYPE_LABELS[type]}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {WIDGET_TYPE_DESCRIPTIONS[type]}
                    </Text>
                  </div>
                </Group>
                <Button size="xs" variant="light" onClick={() => onAdd(type)}>
                  Ajouter
                </Button>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Drawer>
  );
}

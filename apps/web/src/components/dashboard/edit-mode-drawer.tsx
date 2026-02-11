import { Drawer, Stack, Card, Group, Text, Button, ThemeIcon, Badge } from "@mantine/core";
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
  MODULES,
  MODULE_DEFINITIONS,
  WIDGET_MODULE_MAP,
  WIDGET_SIZES,
  WIDGET_SIZE_LABELS,
} from "@personal-os/domain";
import type { WidgetType, ModuleId } from "@personal-os/domain";
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

const MODULE_ICONS: Record<ModuleId, ComponentType<{ size: number; stroke: number }>> = {
  habits: IconTargetArrow,
  budget: IconWallet,
  pets: IconPaw,
};

const WIDGET_COLORS: Record<WidgetType, string> = {
  habit_evolution: "teal",
  budget_summary: "amber",
  pet_today_activities: "blue",
  pet_activities: "violet",
  pet_weight_evolution: "cyan",
};

function groupWidgetsByModule(): Record<ModuleId, WidgetType[]> {
  const groups: Record<ModuleId, WidgetType[]> = { habits: [], budget: [], pets: [] };
  for (const type of WIDGET_TYPES) {
    const moduleId = WIDGET_MODULE_MAP[type];
    groups[moduleId].push(type);
  }
  return groups;
}

export function EditModeDrawer({ opened, onClose, onAdd }: Props) {
  const grouped = groupWidgetsByModule();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Ajouter un widget"
      position="right"
      size="sm"
    >
      <Stack>
        {MODULES.map((moduleId) => {
          const widgets = grouped[moduleId];
          if (widgets.length === 0) return null;
          const moduleDef = MODULE_DEFINITIONS[moduleId];
          const ModuleIcon = MODULE_ICONS[moduleId];

          return (
            <div key={moduleId}>
              <Group gap="xs" mb="xs">
                <ModuleIcon size={16} stroke={1.5} />
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  c={moduleDef.color}
                >
                  {moduleDef.label}
                </Text>
              </Group>
              <Stack gap="xs">
                {widgets.map((type) => {
                  const Icon = WIDGET_ICONS[type];
                  const widgetSize = WIDGET_SIZES[type];
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
                            <Group gap={6}>
                              <Text size="sm" fw={500}>
                                {WIDGET_TYPE_LABELS[type]}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color="gray"
                              >
                                {WIDGET_SIZE_LABELS[widgetSize]}
                              </Badge>
                            </Group>
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
            </div>
          );
        })}
      </Stack>
    </Drawer>
  );
}

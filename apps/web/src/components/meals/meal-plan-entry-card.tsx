import { Card, Text, Badge, Group, Menu, ActionIcon, Image, Box } from "@mantine/core";
import { IconDots, IconTrash } from "@tabler/icons-react";
import { scaleMacros } from "@personal-os/domain";
import { MacrosDisplay } from "./macros-display";
import type { MealPlanEntryDetail } from "../../hooks/use-meals";

interface MealPlanEntryCardProps {
  entry: MealPlanEntryDetail;
  onDelete: () => void;
  onClick: () => void;
}

export function MealPlanEntryCard({ entry, onDelete, onClick }: MealPlanEntryCardProps) {
  const scaled = scaleMacros(entry.recipe, entry.recipe.servings, entry.servings);

  return (
    <Card padding="xs" radius="sm" withBorder style={{ minWidth: 0, cursor: "pointer" }}>
      <Box onClick={onClick}>
        {entry.recipe.photoUrl && (
          <Card.Section>
            <Image
              src={entry.recipe.photoUrl}
              height={60}
              alt={entry.recipe.title}
              fallbackSrc="https://placehold.co/120x60?text=..."
            />
          </Card.Section>
        )}
        <Text size="xs" fw={500} lineClamp={1} mt={4}>
          {entry.recipe.title}
        </Text>
        <Badge size="xs" variant="light" color="gray" mt={2}>
          {entry.servings} pers.
        </Badge>
        <Box mt={2}>
          <MacrosDisplay {...scaled} size="sm" />
        </Box>
      </Box>
      <Group justify="flex-end" mt={2}>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" size="xs" color="gray" onClick={(e) => e.stopPropagation()}>
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={onDelete}
            >
              Retirer
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

import {
  Card,
  Text,
  Group,
  Checkbox,
  Badge,
  Stack,
} from "@mantine/core";
import { useToggleChecklistItem } from "../../hooks/use-puppy";
import type { ChecklistItemFull } from "../../hooks/use-puppy";
import type { Pet } from "@personal-os/domain";

interface Props {
  pet: Pet;
  items: ChecklistItemFull[];
  householdId: string;
}

export function ChecklistCard({ pet, items, householdId }: Props) {
  const toggleItem = useToggleChecklistItem(householdId, pet.id);

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <Text fw={500} size="lg">
            {pet.name}
          </Text>
          {pet.breed && (
            <Text size="sm" c="dimmed">
              {pet.breed}
            </Text>
          )}
        </Group>
        <Badge
          variant="light"
          color={completed === total && total > 0 ? "green" : "gray"}
        >
          {completed}/{total}
        </Badge>
      </Group>

      {items.length === 0 && (
        <Text c="dimmed" size="sm">
          No routines set up yet. Add routines from the pet detail page.
        </Text>
      )}

      <Stack gap="xs">
        {items.map((item) => (
          <Group key={item.id} justify="space-between" wrap="nowrap">
            <Checkbox
              label={
                <Group gap="xs">
                  <Text size="sm">{item.template.name}</Text>
                  <Text size="xs" c="dimmed">
                    {item.template.time}
                  </Text>
                </Group>
              }
              checked={item.completed}
              onChange={() => toggleItem.mutate(item.id)}
            />
            {item.completedBy && (
              <Badge size="xs" variant="light">
                {item.completedBy.name || item.completedBy.email}
              </Badge>
            )}
          </Group>
        ))}
      </Stack>
    </Card>
  );
}

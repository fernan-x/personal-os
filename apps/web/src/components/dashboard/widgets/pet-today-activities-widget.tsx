import { Text, Center, Loader, Group, Stack, Badge, ThemeIcon } from "@mantine/core";
import { IconCheck, IconClock } from "@tabler/icons-react";
import { useTodayChecklist } from "../../../hooks/use-puppy";
import type { TodayChecklist } from "../../../hooks/use-puppy";

interface Props {
  config: Record<string, unknown>;
}

export function PetTodayActivitiesWidget({ config }: Props) {
  const householdId = config.householdId as string;
  const petId = config.petId as string;
  const { data: checklists, isLoading } = useTodayChecklist(householdId || "");

  if (!householdId || !petId) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Configurez un animal
      </Text>
    );
  }

  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  const petChecklist = checklists?.find(
    (c: TodayChecklist) => c.pet.id === petId,
  );

  if (!petChecklist || petChecklist.items.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Pas de routines prévues aujourd'hui
      </Text>
    );
  }

  const completed = petChecklist.items.filter((i) => i.completed).length;
  const total = petChecklist.items.length;

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>{petChecklist.pet.name}</Text>
        <Badge
          variant="light"
          color={completed === total ? "teal" : "gray"}
          size="sm"
        >
          {completed}/{total}
        </Badge>
      </Group>
      {petChecklist.items.map((item) => (
        <Group key={item.id} gap="xs">
          <ThemeIcon
            variant="light"
            color={item.completed ? "teal" : "gray"}
            size="xs"
            radius="xl"
          >
            {item.completed ? <IconCheck size={10} /> : <IconClock size={10} />}
          </ThemeIcon>
          <Text size="xs" c={item.completed ? "dimmed" : undefined} td={item.completed ? "line-through" : undefined}>
            {item.template.time} — {item.template.name}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

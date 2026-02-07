import {
  Card,
  Text,
  Group,
  Button,
  Stack,
  ActionIcon,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useRoutineTemplates,
  useDeleteRoutineTemplate,
} from "../../hooks/use-puppy";
import { AddRoutineModal } from "./add-routine-modal";

interface Props {
  householdId: string;
  petId: string;
}

export function RoutineSetup({ householdId, petId }: Props) {
  const { data: routines, isLoading } = useRoutineTemplates(
    householdId,
    petId,
  );
  const deleteRoutine = useDeleteRoutineTemplate(householdId, petId);
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={500}>Modèles de routine</Text>
        <Button size="sm" onClick={openAdd}>
          Ajouter une routine
        </Button>
      </Group>

      {isLoading && <Text c="dimmed">Chargement...</Text>}

      {routines && routines.length === 0 && (
        <Text c="dimmed" size="sm">
          Aucune routine configurée. Ajoutez votre première routine quotidienne !
        </Text>
      )}

      {routines &&
        routines.map((routine) => (
          <Card key={routine.id} shadow="xs" padding="sm" radius="sm" withBorder>
            <Group justify="space-between">
              <Group gap="sm">
                <Text size="sm" fw={500}>
                  {routine.name}
                </Text>
                <Badge size="sm" variant="light">
                  {routine.time}
                </Badge>
                <Badge size="sm" variant="outline">
                  {routine.type}
                </Badge>
              </Group>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => deleteRoutine.mutate(routine.id)}
              >
                x
              </ActionIcon>
            </Group>
          </Card>
        ))}

      <AddRoutineModal
        householdId={householdId}
        petId={petId}
        opened={addOpened}
        onClose={closeAdd}
      />
    </Stack>
  );
}

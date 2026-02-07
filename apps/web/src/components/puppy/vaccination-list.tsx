import { Stack, Card, Text, Group, Badge, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useVaccinations, useDeleteVaccination } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
}

export function VaccinationList({ householdId, petId }: Props) {
  const { data: vaccinations, isLoading } = useVaccinations(householdId, petId);
  const deleteVax = useDeleteVaccination(householdId, petId);

  if (isLoading) return <Text c="dimmed">Chargement...</Text>;

  if (!vaccinations || vaccinations.length === 0) {
    return <Text c="dimmed" size="sm">Aucun vaccin enregistré.</Text>;
  }

  const now = new Date();

  return (
    <Stack>
      {vaccinations.map((vax) => {
        const isDue = vax.nextDueDate && new Date(vax.nextDueDate) <= now;
        return (
          <Card key={vax.id} shadow="xs" padding="sm" radius="sm" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{vax.name}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(vax.date).toLocaleDateString("fr-FR")}
                  </Text>
                </Group>
                {vax.nextDueDate && (
                  <Badge
                    size="xs"
                    mt={4}
                    variant="light"
                    color={isDue ? "red" : "orange"}
                  >
                    {isDue ? "En retard" : "Prévu"} : {new Date(vax.nextDueDate).toLocaleDateString("fr-FR")}
                  </Badge>
                )}
              </div>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => deleteVax.mutate(vax.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}

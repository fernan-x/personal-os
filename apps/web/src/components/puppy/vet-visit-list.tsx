import { Stack, Card, Text, Group, Badge, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useVetVisits, useDeleteVetVisit } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
}

export function VetVisitList({ householdId, petId }: Props) {
  const { data: visits, isLoading } = useVetVisits(householdId, petId);
  const deleteVisit = useDeleteVetVisit(householdId, petId);

  if (isLoading) return <Text c="dimmed">Chargement...</Text>;

  if (!visits || visits.length === 0) {
    return <Text c="dimmed" size="sm">Aucune visite vétérinaire enregistrée.</Text>;
  }

  const now = new Date();

  return (
    <Stack>
      {visits.map((visit) => {
        const isUpcoming = visit.nextVisitDate && new Date(visit.nextVisitDate) > now;
        return (
          <Card key={visit.id} shadow="xs" padding="sm" radius="sm" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{visit.reason}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(visit.date).toLocaleDateString("fr-FR")}
                  </Text>
                </Group>
                {visit.notes && (
                  <Text size="xs" c="dimmed" mt={2}>{visit.notes}</Text>
                )}
                {visit.nextVisitDate && (
                  <Badge
                    size="xs"
                    mt={4}
                    variant="light"
                    color={isUpcoming ? "orange" : "gray"}
                  >
                    Prochaine : {new Date(visit.nextVisitDate).toLocaleDateString("fr-FR")}
                  </Badge>
                )}
              </div>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => deleteVisit.mutate(visit.id)}
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

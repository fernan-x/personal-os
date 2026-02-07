import { Stack, Card, Text, Group, Badge, ActionIcon } from "@mantine/core";
import { useMedications, useDeleteMedication } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
}

export function MedicationList({ householdId, petId }: Props) {
  const { data: medications, isLoading } = useMedications(householdId, petId);
  const deleteMed = useDeleteMedication(householdId, petId);

  if (isLoading) return <Text c="dimmed">Chargement...</Text>;

  if (!medications || medications.length === 0) {
    return <Text c="dimmed" size="sm">Aucun médicament enregistré.</Text>;
  }

  const now = new Date();

  return (
    <Stack>
      {medications.map((med) => {
        const isActive = !med.endDate || new Date(med.endDate) >= now;
        return (
          <Card key={med.id} shadow="xs" padding="sm" radius="sm" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{med.name}</Text>
                  <Badge size="xs" variant="light" color={isActive ? "green" : "gray"}>
                    {isActive ? "Actif" : "Terminé"}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  {med.dosage} &middot; {med.frequency.replace(/_/g, " ")}
                </Text>
                <Text size="xs" c="dimmed">
                  Début {new Date(med.startDate).toLocaleDateString("fr-FR")}
                  {med.endDate && ` — Fin ${new Date(med.endDate).toLocaleDateString("fr-FR")}`}
                </Text>
                {med.notes && (
                  <Text size="xs" c="dimmed" mt={2}>{med.notes}</Text>
                )}
              </div>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => deleteMed.mutate(med.id)}
              >
                x
              </ActionIcon>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}

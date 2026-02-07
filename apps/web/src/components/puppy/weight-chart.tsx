import { Stack, Text, Table, Group, ActionIcon } from "@mantine/core";
import {
  useWeightEntries,
  useDeleteWeightEntry,
} from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams} g`;
}

export function WeightChart({ householdId, petId }: Props) {
  const { data: entries, isLoading } = useWeightEntries(householdId, petId);
  const deleteEntry = useDeleteWeightEntry(householdId, petId);

  if (isLoading) return <Text c="dimmed">Chargement...</Text>;

  if (!entries || entries.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        Aucune entrée de poids. Enregistrez le premier poids de votre animal !
      </Text>
    );
  }

  const latest = entries[entries.length - 1];
  const previous = entries.length >= 2 ? entries[entries.length - 2] : null;
  const diff = previous ? latest.weight - previous.weight : null;

  return (
    <Stack>
      <Group gap="sm">
        <Text fw={500} size="lg">
          Actuel : {formatWeight(latest.weight)}
        </Text>
        {diff !== null && (
          <Text size="sm" c={diff >= 0 ? "green" : "red"}>
            ({diff >= 0 ? "+" : ""}
            {formatWeight(diff)} depuis la dernière pesée)
          </Text>
        )}
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Poids</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {[...entries].reverse().map((entry) => (
            <Table.Tr key={entry.id}>
              <Table.Td>
                {new Date(entry.date).toLocaleDateString("fr-FR")}
              </Table.Td>
              <Table.Td>{formatWeight(entry.weight)}</Table.Td>
              <Table.Td>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => deleteEntry.mutate(entry.id)}
                >
                  x
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

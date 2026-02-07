import {
  Card,
  Text,
  Group,
  Progress,
  Button,
  Stack,
  Table,
  ActionIcon,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LogEntryModal } from "./log-entry-modal";
import { useDeleteEnvelopeEntry } from "../../hooks/use-envelopes";
import { useAuth } from "../../contexts/auth-context";

interface EnvelopeEntry {
  id: string;
  userId: string;
  amount: number;
  note: string | null;
  date: string;
  user: { id: string; email: string; name: string | null };
}

interface Props {
  groupId: string;
  planId: string;
  envelope: {
    id: string;
    categoryId: string;
    allocatedAmount: number;
    spent: number;
    remaining: number;
    category: { id: string; name: string; icon: string | null };
    entries: EnvelopeEntry[];
  };
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function EnvelopeCard({ groupId, planId, envelope }: Props) {
  const [logOpened, { open: openLog, close: closeLog }] = useDisclosure(false);
  const deleteEntry = useDeleteEnvelopeEntry(groupId, planId, envelope.id);
  const { user } = useAuth();

  const percentUsed =
    envelope.allocatedAmount > 0
      ? Math.min((envelope.spent / envelope.allocatedAmount) * 100, 100)
      : 0;
  const isOverBudget = envelope.spent > envelope.allocatedAmount;

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={500}>{envelope.category.name}</Text>
            <Badge
              color={isOverBudget ? "red" : "green"}
              variant="light"
            >
              {formatCents(envelope.remaining)} € restants
            </Badge>
          </Group>

          <Progress
            value={percentUsed}
            color={isOverBudget ? "red" : percentUsed > 80 ? "yellow" : "blue"}
            size="lg"
          />

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {formatCents(envelope.spent)} € / {formatCents(envelope.allocatedAmount)} €
            </Text>
            <Button size="xs" onClick={openLog}>
              Enregistrer une dépense
            </Button>
          </Group>

          {envelope.entries.length > 0 && (
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Note</Table.Th>
                  <Table.Th>Utilisateur</Table.Th>
                  <Table.Th ta="right">Montant</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {envelope.entries.map((entry) => (
                  <Table.Tr key={entry.id}>
                    <Table.Td>
                      {new Date(entry.date).toLocaleDateString("fr-FR")}
                    </Table.Td>
                    <Table.Td>{entry.note || "-"}</Table.Td>
                    <Table.Td>
                      {entry.user.name || entry.user.email}
                    </Table.Td>
                    <Table.Td ta="right">
                      {formatCents(entry.amount)} €
                    </Table.Td>
                    <Table.Td>
                      {entry.userId === user?.id && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="sm"
                          onClick={() => deleteEntry.mutate(entry.id)}
                        >
                          x
                        </ActionIcon>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      <LogEntryModal
        groupId={groupId}
        planId={planId}
        envelopeId={envelope.id}
        categoryName={envelope.category.name}
        opened={logOpened}
        onClose={closeLog}
      />
    </>
  );
}

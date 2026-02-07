import {
  Stack,
  Text,
  Card,
  SimpleGrid,
  Table,
  Loader,
  Center,
  ThemeIcon,
  Group,
} from "@mantine/core";
import { IconCash, IconReceipt, IconPigMoney } from "@tabler/icons-react";
import {
  usePlanSummary,
  useBudgetGroup,
} from "../../hooks/use-budget";

interface Props {
  groupId: string;
  planId: string;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function SummaryView({ groupId, planId }: Props) {
  const { data: summary, isLoading } = usePlanSummary(groupId, planId);
  const { data: group } = useBudgetGroup(groupId);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!summary) return null;

  const memberMap = new Map(
    group?.members.map((m) => [m.userId, m.user.name || m.user.email]) ?? [],
  );

  return (
    <Stack>
      <Text fw={500} size="lg">
        Résumé
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="sm" mb="xs">
            <ThemeIcon variant="light" color="green" size="md" radius="md">
              <IconCash size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="sm">
              Revenus totaux
            </Text>
          </Group>
          <Text fw={700} size="xl" c="green">
            {formatCents(summary.totalIncome)} €
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="sm" mb="xs">
            <ThemeIcon variant="light" color="red" size="md" radius="md">
              <IconReceipt size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="sm">
              Dépenses totales
            </Text>
          </Group>
          <Text fw={700} size="xl" c="red">
            {formatCents(summary.totalExpenses)} €
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="sm" mb="xs">
            <ThemeIcon variant="light" color={summary.totalSavings >= 0 ? "green" : "red"} size="md" radius="md">
              <IconPigMoney size={16} />
            </ThemeIcon>
            <Text c="dimmed" size="sm">
              Épargne
            </Text>
          </Group>
          <Text
            fw={700}
            size="xl"
            c={summary.totalSavings >= 0 ? "green" : "red"}
          >
            {formatCents(summary.totalSavings)} €
          </Text>
        </Card>
      </SimpleGrid>

      {summary.perUser.length > 0 && (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Membre</Table.Th>
              <Table.Th ta="right">Revenus</Table.Th>
              <Table.Th ta="right">Personnel</Table.Th>
              <Table.Th ta="right">Part commune</Table.Th>
              <Table.Th ta="right">Dépenses totales</Table.Th>
              <Table.Th ta="right">Épargne</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {summary.perUser.map((u) => (
              <Table.Tr key={u.userId}>
                <Table.Td>{memberMap.get(u.userId) ?? u.userId}</Table.Td>
                <Table.Td ta="right">{formatCents(u.totalIncome)} €</Table.Td>
                <Table.Td ta="right">
                  {formatCents(u.personalExpenses)} €
                </Table.Td>
                <Table.Td ta="right">
                  {formatCents(u.commonExpenseShare)} €
                </Table.Td>
                <Table.Td ta="right">
                  {formatCents(u.totalExpenses)} €
                </Table.Td>
                <Table.Td
                  ta="right"
                  c={u.savings >= 0 ? "green" : "red"}
                >
                  {formatCents(u.savings)} €
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

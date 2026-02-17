import {
  Stack,
  Text,
  Card,
  SimpleGrid,
  Table,
  Group,
  ThemeIcon,
  Badge,
  Progress,
} from "@mantine/core";
import {
  IconCash,
  IconReceipt,
  IconPigMoney,
} from "@tabler/icons-react";
import type { PlanSummary } from "@personal-os/domain";
import type { MonthlyPlanFull } from "../../hooks/use-budget";

interface Props {
  plan: MonthlyPlanFull;
  summary: PlanSummary;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function PlanOverview({ plan, summary }: Props) {
  // Group expenses by category
  const byCategory = new Map<string, { name: string; total: number }>();
  for (const expense of plan.expenses) {
    const catName = expense.category?.name ?? "Sans catégorie";
    const existing = byCategory.get(catName);
    byCategory.set(catName, {
      name: catName,
      total: (existing?.total ?? 0) + expense.amount,
    });
  }
  const categoryGroups = [...byCategory.values()].sort((a, b) => b.total - a.total);

  // Group expenses by scope
  const personalTotal = plan.expenses
    .filter((e) => e.scope === "personal")
    .reduce((sum, e) => sum + e.amount, 0);
  const commonTotal = plan.expenses
    .filter((e) => e.scope === "common")
    .reduce((sum, e) => sum + e.amount, 0);

  // Envelope overview
  const envelopeOverview = plan.envelopes.map((env) => {
    const spent = env.entries.reduce((sum, e) => sum + e.amount, 0);
    return {
      category: env.category.name,
      allocated: env.allocatedAmount,
      spent,
      remaining: env.allocatedAmount - spent,
    };
  });

  return (
    <Stack>
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
            <ThemeIcon
              variant="light"
              color={summary.totalSavings >= 0 ? "green" : "red"}
              size="md"
              radius="md"
            >
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

      {categoryGroups.length > 0 && (
        <>
          <Text fw={500} size="lg" mt="md">
            Dépenses par catégorie
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Catégorie</Table.Th>
                <Table.Th ta="right">Montant</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {categoryGroups.map((g) => (
                <Table.Tr key={g.name}>
                  <Table.Td>{g.name}</Table.Td>
                  <Table.Td ta="right">{formatCents(g.total)} €</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}

      {(personalTotal > 0 || commonTotal > 0) && (
        <>
          <Text fw={500} size="lg" mt="md">
            Dépenses par portée
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text c="dimmed" size="sm" mb="xs">
                Personnel
              </Text>
              <Text fw={700} size="lg">
                {formatCents(personalTotal)} €
              </Text>
            </Card>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text c="dimmed" size="sm" mb="xs">
                Commun
              </Text>
              <Text fw={700} size="lg">
                {formatCents(commonTotal)} €
              </Text>
            </Card>
          </SimpleGrid>
        </>
      )}

      {envelopeOverview.length > 0 && (
        <>
          <Text fw={500} size="lg" mt="md">
            Enveloppes
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Catégorie</Table.Th>
                <Table.Th ta="right">Alloué</Table.Th>
                <Table.Th ta="right">Dépensé</Table.Th>
                <Table.Th ta="right">Restant</Table.Th>
                <Table.Th>Progression</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {envelopeOverview.map((env) => {
                const pct =
                  env.allocated > 0
                    ? Math.round((env.spent / env.allocated) * 100)
                    : 0;
                const color = pct < 75 ? "blue" : pct < 100 ? "yellow" : "red";
                return (
                  <Table.Tr key={env.category}>
                    <Table.Td>{env.category}</Table.Td>
                    <Table.Td ta="right">{formatCents(env.allocated)} €</Table.Td>
                    <Table.Td ta="right">{formatCents(env.spent)} €</Table.Td>
                    <Table.Td ta="right">
                      <Text c={env.remaining >= 0 ? undefined : "red"}>
                        {formatCents(env.remaining)} €
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Progress
                        value={Math.min(pct, 100)}
                        color={color}
                        size="sm"
                        style={{ minWidth: 80 }}
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Stack>
  );
}

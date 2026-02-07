import {
  Stack,
  Group,
  TextInput,
  NumberInput,
  Button,
  Table,
  Text,
  ActionIcon,
} from "@mantine/core";
import { useState } from "react";
import {
  useCreateIncome,
  useDeleteIncome,
  type MonthlyPlanFull,
} from "../../hooks/use-budget";

interface Props {
  groupId: string;
  plan: MonthlyPlanFull;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function IncomeStep({ groupId, plan }: Props) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const createIncome = useCreateIncome(groupId, plan.id);
  const deleteIncome = useDeleteIncome(groupId, plan.id);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = Math.round(Number(amount) * 100);
    if (!source || amountCents <= 0) return;
    createIncome.mutate(
      { source, amount: amountCents },
      {
        onSuccess: () => {
          setSource("");
          setAmount("");
        },
      },
    );
  }

  const totalIncome = plan.incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Stack>
      <Text fw={500} size="lg">
        Revenus
      </Text>

      <form onSubmit={handleAdd}>
        <Group gap="xs" align="end">
          <TextInput
            label="Source"
            placeholder="ex. Salaire"
            value={source}
            onChange={(e) => setSource(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <NumberInput
            label="Montant"
            placeholder="0,00"
            value={amount}
            onChange={setAmount}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="€"
          />
          <Button type="submit" loading={createIncome.isPending}>
            Ajouter
          </Button>
        </Group>
      </form>

      {plan.incomes.length > 0 && (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Source</Table.Th>
              <Table.Th>Utilisateur</Table.Th>
              <Table.Th ta="right">Montant</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {plan.incomes.map((income) => (
              <Table.Tr key={income.id}>
                <Table.Td>{income.source}</Table.Td>
                <Table.Td>{income.user.name || income.user.email}</Table.Td>
                <Table.Td ta="right">{formatCents(income.amount)} €</Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    onClick={() => deleteIncome.mutate(income.id)}
                  >
                    x
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Text fw={600}>Total</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text fw={600}>{formatCents(totalIncome)} €</Text>
              </Table.Td>
              <Table.Td />
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      )}
    </Stack>
  );
}

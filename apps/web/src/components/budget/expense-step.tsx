import {
  Stack,
  Group,
  TextInput,
  NumberInput,
  Select,
  Button,
  Table,
  Text,
  ActionIcon,
  Badge,
  Checkbox,
} from "@mantine/core";
import { useState } from "react";
import {
  useCreatePlannedExpense,
  useDeletePlannedExpense,
  useUpdateExpenseStatus,
  useExpenseCategories,
  type MonthlyPlanFull,
} from "../../hooks/use-budget";

interface Props {
  groupId: string;
  plan: MonthlyPlanFull;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function ExpenseStep({ groupId, plan }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [scope, setScope] = useState<string | null>("personal");
  const [recurrence, setRecurrence] = useState<string | null>("recurring");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const createExpense = useCreatePlannedExpense(groupId, plan.id);
  const deleteExpense = useDeletePlannedExpense(groupId, plan.id);
  const updateStatus = useUpdateExpenseStatus(groupId, plan.id);
  const { data: categories } = useExpenseCategories();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = Math.round(Number(amount) * 100);
    if (!name || amountCents <= 0) return;
    createExpense.mutate(
      {
        name,
        amount: amountCents,
        scope: (scope as "personal" | "common") ?? "personal",
        recurrence: (recurrence as "recurring" | "exceptional") ?? "recurring",
        categoryId: categoryId ?? undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setAmount("");
        },
      },
    );
  }

  function toggleStatus(expenseId: string, currentStatus: string) {
    updateStatus.mutate({
      id: expenseId,
      status: currentStatus === "paid" ? "pending" : "paid",
    });
  }

  const totalExpenses = plan.expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryOptions =
    categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  return (
    <Stack>
      <Text fw={500} size="lg">
        Planned Expenses
      </Text>

      <form onSubmit={handleAdd}>
        <Stack gap="xs">
          <Group gap="xs" align="end">
            <TextInput
              label="Name"
              placeholder="e.g. Rent"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <NumberInput
              label="Amount"
              placeholder="0.00"
              value={amount}
              onChange={setAmount}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
            />
          </Group>
          <Group gap="xs">
            <Select
              label="Scope"
              data={[
                { value: "personal", label: "Personal" },
                { value: "common", label: "Common" },
              ]}
              value={scope}
              onChange={setScope}
              style={{ flex: 1 }}
            />
            <Select
              label="Recurrence"
              data={[
                { value: "recurring", label: "Recurring" },
                { value: "exceptional", label: "Exceptional" },
              ]}
              value={recurrence}
              onChange={setRecurrence}
              style={{ flex: 1 }}
            />
            <Select
              label="Category"
              data={categoryOptions}
              value={categoryId}
              onChange={setCategoryId}
              clearable
              placeholder="Optional"
              style={{ flex: 1 }}
            />
          </Group>
          <Button type="submit" loading={createExpense.isPending}>
            Add Expense
          </Button>
        </Stack>
      </form>

      {plan.expenses.length > 0 && (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Paid</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Scope</Table.Th>
              <Table.Th ta="right">Amount</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {plan.expenses.map((expense) => (
              <Table.Tr key={expense.id}>
                <Table.Td>
                  <Checkbox
                    checked={expense.status === "paid"}
                    onChange={() => toggleStatus(expense.id, expense.status)}
                  />
                </Table.Td>
                <Table.Td>
                  <Text
                    td={expense.status === "paid" ? "line-through" : undefined}
                  >
                    {expense.name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {expense.category?.name ?? "-"}
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    size="sm"
                    color={expense.scope === "common" ? "blue" : "gray"}
                  >
                    {expense.scope}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">${formatCents(expense.amount)}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    onClick={() => deleteExpense.mutate(expense.id)}
                  >
                    x
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text fw={600}>Total</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text fw={600}>${formatCents(totalExpenses)}</Text>
              </Table.Td>
              <Table.Td />
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      )}
    </Stack>
  );
}

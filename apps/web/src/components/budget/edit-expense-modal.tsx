import { useEffect } from "react";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { EXPENSE_NAME_MAX_LENGTH, validateUpdatePlannedExpense } from "@personal-os/domain";
import type { PlannedExpense, ExpenseCategory, UpdatePlannedExpenseInput } from "@personal-os/domain";
import {
  useUpdatePlannedExpense,
  useDeletePlannedExpense,
  useExpenseCategories,
} from "../../hooks/use-budget";

type UserInfo = { id: string; email: string; name: string | null };
type ExpenseWithDetails = PlannedExpense & {
  user: UserInfo | null;
  category: ExpenseCategory | null;
  shares: Array<{ id: string; userId: string; percentage: number; user: UserInfo }>;
};

interface Props {
  expense: ExpenseWithDetails | null;
  opened: boolean;
  onClose: () => void;
  groupId: string;
  planId: string;
}

export function EditExpenseModal({ expense, opened, onClose, groupId, planId }: Props) {
  const updateExpense = useUpdatePlannedExpense(groupId, planId);
  const deleteExpense = useDeletePlannedExpense(groupId, planId);
  const { data: categories } = useExpenseCategories();

  const form = useForm<{
    name: string;
    amount: number | string;
    scope: string;
    recurrence: string;
    categoryId: string | null;
  }>({
    initialValues: {
      name: "",
      amount: "",
      scope: "personal",
      recurrence: "recurring",
      categoryId: null,
    },
    validate: (values) => {
      const input: UpdatePlannedExpenseInput = {
        name: values.name,
        amount: Math.round(Number(values.amount) * 100),
        scope: values.scope as "personal" | "common",
        recurrence: values.recurrence as "recurring" | "exceptional",
        categoryId: values.categoryId,
      };
      const errors = validateUpdatePlannedExpense(input);
      const fieldErrors: Record<string, string> = {};
      for (const error of errors) {
        if (error.field === "amount") {
          fieldErrors["amount"] = "Le montant doit être positif";
        } else {
          fieldErrors[error.field] = error.message;
        }
      }
      return fieldErrors;
    },
  });

  useEffect(() => {
    if (expense) {
      form.setValues({
        name: expense.name,
        amount: expense.amount / 100,
        scope: expense.scope,
        recurrence: expense.recurrence,
        categoryId: expense.categoryId ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense]);

  const categoryOptions =
    categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  function handleSubmit(values: {
    name: string;
    amount: number | string;
    scope: string;
    recurrence: string;
    categoryId: string | null;
  }) {
    if (!expense) return;

    updateExpense.mutate(
      {
        id: expense.id,
        name: values.name,
        amount: Math.round(Number(values.amount) * 100),
        scope: values.scope as "personal" | "common",
        recurrence: values.recurrence as "recurring" | "exceptional",
        categoryId: values.categoryId,
      },
      { onSuccess: () => onClose() },
    );
  }

  function handleDelete() {
    if (!expense) return;
    deleteExpense.mutate(expense.id, { onSuccess: () => onClose() });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Modifier la dépense">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nom"
            placeholder="ex. Loyer"
            maxLength={EXPENSE_NAME_MAX_LENGTH}
            required
            {...form.getInputProps("name")}
          />
          <NumberInput
            label="Montant"
            placeholder="0,00"
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="€"
            required
            {...form.getInputProps("amount")}
          />
          <Select
            label="Portée"
            data={[
              { value: "personal", label: "Personnel" },
              { value: "common", label: "Commun" },
            ]}
            {...form.getInputProps("scope")}
          />
          <Select
            label="Récurrence"
            data={[
              { value: "recurring", label: "Récurrent" },
              { value: "exceptional", label: "Exceptionnel" },
            ]}
            {...form.getInputProps("recurrence")}
          />
          <Select
            label="Catégorie"
            data={categoryOptions}
            clearable
            placeholder="Optionnel"
            {...form.getInputProps("categoryId")}
          />
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              loading={deleteExpense.isPending}
            >
              Supprimer
            </Button>
            <Button type="submit" loading={updateExpense.isPending} leftSection={<IconCheck size={16} />}>
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

import { useEffect } from "react";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { INCOME_SOURCE_MAX_LENGTH, validateUpdateIncome } from "@personal-os/domain";
import type { Income, UpdateIncomeInput } from "@personal-os/domain";
import { useUpdateIncome, useDeleteIncome } from "../../hooks/use-budget";

type UserInfo = { id: string; email: string; name: string | null };

interface Props {
  income: (Income & { user: UserInfo }) | null;
  opened: boolean;
  onClose: () => void;
  groupId: string;
  planId: string;
}

export function EditIncomeModal({ income, opened, onClose, groupId, planId }: Props) {
  const updateIncome = useUpdateIncome(groupId, planId);
  const deleteIncome = useDeleteIncome(groupId, planId);

  const form = useForm<{ source: string; amount: number | string }>({
    initialValues: {
      source: "",
      amount: "",
    },
    validate: (values) => {
      const input: UpdateIncomeInput = {
        source: values.source,
        amount: Math.round(Number(values.amount) * 100),
      };
      const errors = validateUpdateIncome(input);
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
    if (income) {
      form.setValues({
        source: income.source,
        amount: income.amount / 100,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income]);

  function handleSubmit(values: { source: string; amount: number | string }) {
    if (!income) return;

    updateIncome.mutate(
      {
        id: income.id,
        source: values.source,
        amount: Math.round(Number(values.amount) * 100),
      },
      { onSuccess: () => onClose() },
    );
  }

  function handleDelete() {
    if (!income) return;
    deleteIncome.mutate(income.id, { onSuccess: () => onClose() });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Modifier le revenu">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Source"
            placeholder="ex. Salaire"
            maxLength={INCOME_SOURCE_MAX_LENGTH}
            required
            {...form.getInputProps("source")}
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
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              loading={deleteIncome.isPending}
            >
              Supprimer
            </Button>
            <Button type="submit" loading={updateIncome.isPending} leftSection={<IconCheck size={16} />}>
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

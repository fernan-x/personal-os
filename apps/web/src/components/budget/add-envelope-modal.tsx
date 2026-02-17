import { Modal, NumberInput, Select, Button, Stack } from "@mantine/core";
import { useState, useCallback } from "react";
import { IconCheck } from "@tabler/icons-react";
import { useCreateEnvelope } from "../../hooks/use-envelopes";
import { useExpenseCategories, type MonthlyPlanFull } from "../../hooks/use-budget";

interface Props {
  groupId: string;
  planId: string;
  opened: boolean;
  onClose: () => void;
  plan?: MonthlyPlanFull;
}

export function AddEnvelopeModal({ groupId, planId, opened, onClose, plan }: Props) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | string>("");
  const [userOverride, setUserOverride] = useState(false);
  const createEnvelope = useCreateEnvelope(groupId, planId);
  const { data: categories } = useExpenseCategories();

  const categoryOptions =
    categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const handleCategoryChange = useCallback(
    (value: string | null) => {
      setCategoryId(value);
      setUserOverride(false);

      if (value && plan) {
        const total = plan.expenses
          .filter((e) => e.category?.id === value)
          .reduce((sum, e) => sum + e.amount, 0);
        if (total > 0) {
          setAmount(total / 100);
        } else {
          setAmount("");
        }
      } else {
        setAmount("");
      }
    },
    [plan],
  );

  function handleAmountChange(value: number | string) {
    setAmount(value);
    setUserOverride(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = Math.round(Number(amount) * 100);
    if (!categoryId || amountCents < 0) return;

    createEnvelope.mutate(
      { categoryId, allocatedAmount: amountCents },
      {
        onSuccess: () => {
          setCategoryId(null);
          setAmount("");
          setUserOverride(false);
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Ajouter une enveloppe">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Catégorie"
            data={categoryOptions}
            value={categoryId}
            onChange={handleCategoryChange}
            required
            placeholder="Sélectionner une catégorie"
          />
          <NumberInput
            label="Montant du budget"
            placeholder="0,00"
            value={amount}
            onChange={handleAmountChange}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="€"
            required
          />
          <Button type="submit" loading={createEnvelope.isPending} leftSection={<IconCheck size={16} />}>
            Créer l'enveloppe
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

import { Modal, NumberInput, Select, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { useCreateEnvelope } from "../../hooks/use-envelopes";
import { useExpenseCategories } from "../../hooks/use-budget";

interface Props {
  groupId: string;
  planId: string;
  opened: boolean;
  onClose: () => void;
}

export function AddEnvelopeModal({ groupId, planId, opened, onClose }: Props) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | string>("");
  const createEnvelope = useCreateEnvelope(groupId, planId);
  const { data: categories } = useExpenseCategories();

  const categoryOptions =
    categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

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
            onChange={setCategoryId}
            required
            placeholder="Sélectionner une catégorie"
          />
          <NumberInput
            label="Montant du budget"
            placeholder="0,00"
            value={amount}
            onChange={setAmount}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="€"
            required
          />
          <Button type="submit" loading={createEnvelope.isPending}>
            Créer l'enveloppe
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

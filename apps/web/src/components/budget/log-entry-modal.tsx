import { Modal, NumberInput, TextInput, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { useCreateEnvelopeEntry } from "../../hooks/use-envelopes";

interface Props {
  groupId: string;
  planId: string;
  envelopeId: string;
  categoryName: string;
  opened: boolean;
  onClose: () => void;
}

export function LogEntryModal({
  groupId,
  planId,
  envelopeId,
  categoryName,
  opened,
  onClose,
}: Props) {
  const [amount, setAmount] = useState<number | string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const createEntry = useCreateEnvelopeEntry(groupId, planId, envelopeId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = Math.round(Number(amount) * 100);
    if (amountCents <= 0 || !date) return;

    createEntry.mutate(
      {
        amount: amountCents,
        note: note || undefined,
        date,
      },
      {
        onSuccess: () => {
          setAmount("");
          setNote("");
          setDate(new Date().toISOString().slice(0, 10));
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title={`Enregistrer une dépense — ${categoryName}`}>
      <form onSubmit={handleSubmit}>
        <Stack>
          <NumberInput
            label="Montant"
            placeholder="0,00"
            value={amount}
            onChange={setAmount}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="€"
            required
          />
          <TextInput
            label="Note"
            placeholder="À quoi correspond cette dépense ?"
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
          <Button type="submit" loading={createEntry.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

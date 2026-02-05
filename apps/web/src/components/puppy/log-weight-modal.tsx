import { Modal, TextInput, Button, Stack, NumberInput } from "@mantine/core";
import { useState } from "react";
import { useCreateWeightEntry } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

export function LogWeightModal({
  householdId,
  petId,
  opened,
  onClose,
}: Props) {
  const [weight, setWeight] = useState<number | string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const createWeight = useCreateWeightEntry(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createWeight.mutate(
      { weight: Number(weight), date },
      {
        onSuccess: () => {
          setWeight("");
          setDate(new Date().toISOString().split("T")[0]);
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Log Weight">
      <form onSubmit={handleSubmit}>
        <Stack>
          <NumberInput
            label="Weight (grams)"
            placeholder="e.g. 5000"
            value={weight}
            onChange={setWeight}
            min={1}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
          <Button type="submit" loading={createWeight.isPending}>
            Log Weight
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

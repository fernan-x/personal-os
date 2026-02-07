import { Modal, TextInput, Button, Stack, NumberInput } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
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
    <Modal opened={opened} onClose={onClose} title="Enregistrer le poids">
      <form onSubmit={handleSubmit}>
        <Stack>
          <NumberInput
            label="Poids (grammes)"
            placeholder="ex. 5000"
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
          <Button type="submit" loading={createWeight.isPending} leftSection={<IconCheck size={16} />}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

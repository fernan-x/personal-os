import { Modal, TextInput, Textarea, Button, Stack } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useCreateTrainingMilestone } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

export function AddMilestoneModal({
  householdId,
  petId,
  opened,
  onClose,
}: Props) {
  const [command, setCommand] = useState("");
  const [notes, setNotes] = useState("");
  const create = useCreateTrainingMilestone(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      { command, notes: notes || undefined },
      {
        onSuccess: () => {
          setCommand("");
          setNotes("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Ajouter un objectif de dressage">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Commande / Comportement"
            placeholder="ex. Assis, Reste, Viens"
            value={command}
            onChange={(e) => setCommand(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Notes"
            placeholder="Notes optionnelles..."
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
          <Button type="submit" loading={create.isPending} leftSection={<IconCheck size={16} />}>
            Ajouter
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

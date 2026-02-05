import { Modal, TextInput, Textarea, Button, Stack } from "@mantine/core";
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
    <Modal opened={opened} onClose={onClose} title="Add Training Goal">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Command / Behavior"
            placeholder="e.g. Sit, Stay, Come"
            value={command}
            onChange={(e) => setCommand(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Notes"
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
          <Button type="submit" loading={create.isPending}>
            Add
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

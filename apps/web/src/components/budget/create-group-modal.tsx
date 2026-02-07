import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { useCreateBudgetGroup } from "../../hooks/use-budget";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ opened, onClose }: Props) {
  const [name, setName] = useState("");
  const createGroup = useCreateBudgetGroup();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createGroup.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Nouveau groupe de budget">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nom du groupe"
            placeholder="ex. Foyer, Couple"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <Button type="submit" loading={createGroup.isPending} leftSection={<IconCheck size={16} />}>
            Créer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

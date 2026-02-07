import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useCreateHousehold } from "../../hooks/use-puppy";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function CreateHouseholdModal({ opened, onClose }: Props) {
  const [name, setName] = useState("");
  const createHousehold = useCreateHousehold();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createHousehold.mutate(
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
    <Modal opened={opened} onClose={onClose} title="Nouveau foyer">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nom du foyer"
            placeholder="ex. Notre maison"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <Button type="submit" loading={createHousehold.isPending} leftSection={<IconCheck size={16} />}>
            Créer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

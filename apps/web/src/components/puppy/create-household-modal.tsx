import { Modal, TextInput, Button, Stack } from "@mantine/core";
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
    <Modal opened={opened} onClose={onClose} title="New Household">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Household name"
            placeholder="e.g. Our Home"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <Button type="submit" loading={createHousehold.isPending}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

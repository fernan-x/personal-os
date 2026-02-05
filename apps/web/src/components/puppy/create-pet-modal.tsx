import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { useCreatePet } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  opened: boolean;
  onClose: () => void;
}

export function CreatePetModal({ householdId, opened, onClose }: Props) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const createPet = useCreatePet(householdId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createPet.mutate(
      {
        name,
        breed: breed || undefined,
        birthDate: birthDate || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setBreed("");
          setBirthDate("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Pet">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="e.g. Max"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Breed"
            placeholder="e.g. Golden Retriever"
            value={breed}
            onChange={(e) => setBreed(e.currentTarget.value)}
          />
          <TextInput
            label="Birth date"
            placeholder="YYYY-MM-DD"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.currentTarget.value)}
          />
          <Button type="submit" loading={createPet.isPending}>
            Add Pet
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

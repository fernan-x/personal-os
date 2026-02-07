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
    <Modal opened={opened} onClose={onClose} title="Ajouter un animal">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nom"
            placeholder="ex. Max"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Race"
            placeholder="ex. Golden Retriever"
            value={breed}
            onChange={(e) => setBreed(e.currentTarget.value)}
          />
          <TextInput
            label="Date de naissance"
            placeholder="JJ/MM/AAAA"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.currentTarget.value)}
          />
          <Button type="submit" loading={createPet.isPending}>
            Ajouter
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

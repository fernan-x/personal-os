import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useState, useEffect } from "react";
import { useUpdatePet } from "../../hooks/use-puppy";
import type { Pet } from "@personal-os/domain";

interface Props {
  householdId: string;
  pet: Pet;
  opened: boolean;
  onClose: () => void;
}

function toDateString(val: string | Date | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? val : val.toISOString();
  return d.split("T")[0];
}

export function EditPetModal({ householdId, pet, opened, onClose }: Props) {
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed || "");
  const [birthDate, setBirthDate] = useState(toDateString(pet.birthDate));
  const updatePet = useUpdatePet(householdId, pet.id);

  useEffect(() => {
    setName(pet.name);
    setBreed(pet.breed || "");
    setBirthDate(toDateString(pet.birthDate));
  }, [pet]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updatePet.mutate(
      {
        name,
        breed: breed || null,
        birthDate: birthDate || null,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Modifier l'animal">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nom"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Race"
            value={breed}
            onChange={(e) => setBreed(e.currentTarget.value)}
          />
          <TextInput
            label="Date de naissance"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.currentTarget.value)}
          />
          <Button type="submit" loading={updatePet.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

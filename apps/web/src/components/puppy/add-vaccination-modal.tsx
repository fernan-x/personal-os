import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { useCreateVaccination } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

export function AddVaccinationModal({ householdId, petId, opened, onClose }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const create = useCreateVaccination(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        name,
        date,
        nextDueDate: nextDueDate || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setDate("");
          setNextDueDate("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Vaccination">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput label="Vaccine name" placeholder="e.g. Rabies" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Date administered" type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} required />
          <TextInput label="Next due date" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.currentTarget.value)} />
          <Button type="submit" loading={create.isPending}>Add</Button>
        </Stack>
      </form>
    </Modal>
  );
}

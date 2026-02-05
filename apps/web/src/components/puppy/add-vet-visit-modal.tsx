import { Modal, TextInput, Textarea, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { useCreateVetVisit } from "../../hooks/use-puppy";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

export function AddVetVisitModal({ householdId, petId, opened, onClose }: Props) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const create = useCreateVetVisit(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        date,
        reason,
        notes: notes || undefined,
        nextVisitDate: nextVisitDate || undefined,
      },
      {
        onSuccess: () => {
          setDate("");
          setReason("");
          setNotes("");
          setNextVisitDate("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Vet Visit">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput label="Date" type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} required />
          <TextInput label="Reason" placeholder="e.g. Annual checkup" value={reason} onChange={(e) => setReason(e.currentTarget.value)} required />
          <Textarea label="Notes" placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
          <TextInput label="Next visit date" type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.currentTarget.value)} />
          <Button type="submit" loading={create.isPending}>Add</Button>
        </Stack>
      </form>
    </Modal>
  );
}

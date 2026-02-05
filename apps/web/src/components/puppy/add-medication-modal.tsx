import { Modal, TextInput, Textarea, Button, Stack, Select } from "@mantine/core";
import { useState } from "react";
import { useCreateMedication } from "../../hooks/use-puppy";
import { MEDICATION_FREQUENCIES } from "@personal-os/domain";
import type { MedicationFrequency } from "@personal-os/domain";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

const frequencyOptions = MEDICATION_FREQUENCIES.map((f) => ({
  value: f,
  label: f.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
}));

export function AddMedicationModal({ householdId, petId, opened, onClose }: Props) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<string>("once_daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const create = useCreateMedication(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        name,
        dosage,
        frequency: frequency as MedicationFrequency,
        startDate,
        endDate: endDate || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setDosage("");
          setFrequency("once_daily");
          setStartDate("");
          setEndDate("");
          setNotes("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Medication">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput label="Name" placeholder="e.g. Heartgard" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Dosage" placeholder="e.g. 1 tablet" value={dosage} onChange={(e) => setDosage(e.currentTarget.value)} required />
          <Select label="Frequency" data={frequencyOptions} value={frequency} onChange={(v) => v && setFrequency(v)} required />
          <TextInput label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} required />
          <TextInput label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} />
          <Textarea label="Notes" placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
          <Button type="submit" loading={create.isPending}>Add</Button>
        </Stack>
      </form>
    </Modal>
  );
}

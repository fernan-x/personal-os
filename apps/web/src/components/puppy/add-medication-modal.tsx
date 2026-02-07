import { Modal, TextInput, Textarea, Button, Stack, Select } from "@mantine/core";
import { useState } from "react";
import { useCreateMedication } from "../../hooks/use-puppy";
import { MEDICATION_FREQUENCIES } from "@personal-os/domain";
import type { MedicationFrequency } from "@personal-os/domain";
import { MEDICATION_FREQUENCY_LABELS_FR } from "../../lib/labels";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

const frequencyOptions = MEDICATION_FREQUENCIES.map((f) => ({
  value: f,
  label: MEDICATION_FREQUENCY_LABELS_FR[f] ?? f,
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
    <Modal opened={opened} onClose={onClose} title="Ajouter un médicament">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput label="Nom" placeholder="ex. Heartgard" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Dosage" placeholder="ex. 1 comprimé" value={dosage} onChange={(e) => setDosage(e.currentTarget.value)} required />
          <Select label="Fréquence" data={frequencyOptions} value={frequency} onChange={(v) => v && setFrequency(v)} required />
          <TextInput label="Date de début" type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} required />
          <TextInput label="Date de fin" type="date" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} />
          <Textarea label="Notes" placeholder="Notes optionnelles..." value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
          <Button type="submit" loading={create.isPending}>Ajouter</Button>
        </Stack>
      </form>
    </Modal>
  );
}

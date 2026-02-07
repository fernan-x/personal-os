import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useCreateRoutineTemplate } from "../../hooks/use-puppy";
import { ACTIVITY_TYPES } from "@personal-os/domain";
import type { ActivityType } from "@personal-os/domain";
import { ACTIVITY_TYPE_LABELS_FR } from "../../lib/labels";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

const typeOptions = ACTIVITY_TYPES.map((t) => ({
  value: t,
  label: ACTIVITY_TYPE_LABELS_FR[t] ?? t,
}));

export function AddRoutineModal({
  householdId,
  petId,
  opened,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("08:00");
  const [type, setType] = useState<string>("meal");
  const createRoutine = useCreateRoutineTemplate(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createRoutine.mutate(
      { name, time, type: type as ActivityType },
      {
        onSuccess: () => {
          setName("");
          setTime("08:00");
          setType("meal");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Ajouter une routine">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nom"
            placeholder="ex. Repas du matin"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Heure"
            placeholder="HH:mm"
            type="time"
            value={time}
            onChange={(e) => setTime(e.currentTarget.value)}
            required
          />
          <Select
            label="Type"
            data={typeOptions}
            value={type}
            onChange={(v) => v && setType(v)}
            required
          />
          <Button type="submit" loading={createRoutine.isPending} leftSection={<IconCheck size={16} />}>
            Ajouter
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

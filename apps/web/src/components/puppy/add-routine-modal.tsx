import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useState } from "react";
import { useCreateRoutineTemplate } from "../../hooks/use-puppy";
import { ACTIVITY_TYPES } from "@personal-os/domain";
import type { ActivityType } from "@personal-os/domain";

interface Props {
  householdId: string;
  petId: string;
  opened: boolean;
  onClose: () => void;
}

const typeOptions = ACTIVITY_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
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
    <Modal opened={opened} onClose={onClose} title="Add Routine">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="e.g. Morning meal"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Time"
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
          <Button type="submit" loading={createRoutine.isPending}>
            Add
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

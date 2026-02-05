import {
  Modal,
  Button,
  Stack,
  Select,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { useState } from "react";
import { useCreateActivityLog } from "../../hooks/use-puppy";
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

export function LogActivityModal({
  householdId,
  petId,
  opened,
  onClose,
}: Props) {
  const [type, setType] = useState<string>("walk");
  const [duration, setDuration] = useState<number | string>("");
  const [note, setNote] = useState("");
  const createLog = useCreateActivityLog(householdId, petId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createLog.mutate(
      {
        type: type as ActivityType,
        duration: duration ? Number(duration) : undefined,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setType("walk");
          setDuration("");
          setNote("");
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Log Activity">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Type"
            data={typeOptions}
            value={type}
            onChange={(v) => v && setType(v)}
            required
          />
          <NumberInput
            label="Duration (minutes)"
            placeholder="Optional"
            value={duration}
            onChange={setDuration}
            min={1}
          />
          <Textarea
            label="Note"
            placeholder="Optional note..."
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            maxLength={1000}
          />
          <Button type="submit" loading={createLog.isPending}>
            Log
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

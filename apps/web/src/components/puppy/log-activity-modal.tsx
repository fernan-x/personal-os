import {
  Modal,
  Button,
  Stack,
  Select,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useCreateActivityLog } from "../../hooks/use-puppy";
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
    <Modal opened={opened} onClose={onClose} title="Enregistrer une activité">
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
            label="Durée (minutes)"
            placeholder="Optionnel"
            value={duration}
            onChange={setDuration}
            min={1}
          />
          <Textarea
            label="Note"
            placeholder="Note optionnelle..."
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            maxLength={1000}
          />
          <Button type="submit" loading={createLog.isPending} leftSection={<IconCheck size={16} />}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

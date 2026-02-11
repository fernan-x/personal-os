import {
  Text,
  Center,
  Loader,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Button,
  Select,
  TextInput,
  NumberInput,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  useActivityLogs,
  useCreateActivityLog,
} from "../../../hooks/use-puppy";
import { ACTIVITY_TYPES } from "@personal-os/domain";
import type { ActivityType } from "@personal-os/domain";
import { ACTIVITY_TYPE_LABELS_FR } from "../../../lib/labels";

interface Props {
  config: Record<string, unknown>;
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const diff = Math.round(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const activityOptions = ACTIVITY_TYPES.map((t) => ({
  value: t,
  label: ACTIVITY_TYPE_LABELS_FR[t] ?? t,
}));

export function PetActivitiesWidget({ config }: Props) {
  const householdId = config.householdId as string;
  const petId = config.petId as string;
  const [dayOffset, setDayOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<string>("walk");
  const [newDuration, setNewDuration] = useState<number | string>("");
  const [newNote, setNewNote] = useState("");

  const { data: logs, isLoading } = useActivityLogs(
    householdId || "",
    petId || "",
  );
  const createLog = useCreateActivityLog(householdId || "", petId || "");

  if (!householdId || !petId) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="md">
        Configurez un animal
      </Text>
    );
  }

  if (isLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - dayOffset);
  const dateKey = toDateKey(targetDate);

  const dayLogs = (logs ?? []).filter(
    (log) => toDateKey(new Date(log.loggedAt)) === dateKey,
  );

  const isToday = dayOffset === 0;

  function handleAdd() {
    createLog.mutate(
      {
        type: newType as ActivityType,
        duration:
          typeof newDuration === "number" && newDuration > 0
            ? newDuration
            : undefined,
        note: newNote || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setNewType("walk");
          setNewDuration("");
          setNewNote("");
        },
      },
    );
  }

  return (
    <Stack gap="xs" className="h-full">
      {/* Day navigation */}
      <Group justify="space-between">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => setDayOffset(dayOffset + 1)}
        >
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text size="sm" fw={500}>
          {formatDateLabel(targetDate)}
        </Text>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
          disabled={isToday}
        >
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto">
        <Stack gap="xs">
          {dayLogs.length === 0 ? (
            <Text c="dimmed" size="xs" ta="center" py="xs">
              Aucune activité
            </Text>
          ) : (
            dayLogs.map((log) => (
              <Group key={log.id} gap="xs" wrap="nowrap">
                <Badge variant="light" size="xs">
                  {ACTIVITY_TYPE_LABELS_FR[log.type] ?? log.type}
                </Badge>
                {log.duration && (
                  <Text size="xs" c="dimmed">
                    {log.duration} min
                  </Text>
                )}
                {log.note && (
                  <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                    {log.note}
                  </Text>
                )}
                <Text size="xs" c="dimmed">
                  {new Date(log.loggedAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Group>
            ))
          )}
        </Stack>
      </div>

      {/* Quick add */}
      {isToday && !showForm && (
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={() => setShowForm(true)}
          fullWidth
        >
          Ajouter
        </Button>
      )}

      {showForm && (
        <Stack gap="xs">
          <Group gap="xs" align="flex-end">
            <Select
              size="xs"
              data={activityOptions}
              value={newType}
              onChange={(v) => setNewType(v || "walk")}
              style={{ flex: 1 }}
            />
            <NumberInput
              size="xs"
              placeholder="min"
              value={newDuration}
              onChange={setNewDuration}
              min={1}
              style={{ width: 70 }}
            />
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={() => setShowForm(false)}
            >
              <IconX size={14} />
            </ActionIcon>
          </Group>
          <TextInput
            size="xs"
            placeholder="Note (optionnel)"
            value={newNote}
            onChange={(e) => setNewNote(e.currentTarget.value)}
          />
          <Button
            size="xs"
            onClick={handleAdd}
            loading={createLog.isPending}
            fullWidth
          >
            Enregistrer
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

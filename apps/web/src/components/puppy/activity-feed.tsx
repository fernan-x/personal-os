import {
  Stack,
  Group,
  Text,
  Badge,
  ActionIcon,
  Select,
  Card,
} from "@mantine/core";
import { useState } from "react";
import {
  useActivityLogs,
  useDeleteActivityLog,
} from "../../hooks/use-puppy";
import { ACTIVITY_TYPES } from "@personal-os/domain";
import type { ActivityType } from "@personal-os/domain";
import { ACTIVITY_TYPE_LABELS_FR } from "../../lib/labels";

interface Props {
  householdId: string;
  petId: string;
}

const filterOptions = [
  { value: "", label: "Tous les types" },
  ...ACTIVITY_TYPES.map((t) => ({
    value: t,
    label: ACTIVITY_TYPE_LABELS_FR[t] ?? t,
  })),
];

export function ActivityFeed({ householdId, petId }: Props) {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const { data: logs, isLoading } = useActivityLogs(
    householdId,
    petId,
    typeFilter ? { type: typeFilter as ActivityType } : undefined,
  );
  const deleteLog = useDeleteActivityLog(householdId, petId);

  return (
    <Stack>
      <Select
        label="Filtrer par type"
        data={filterOptions}
        value={typeFilter}
        onChange={(v) => setTypeFilter(v ?? "")}
        clearable
        size="sm"
        style={{ maxWidth: 200 }}
      />

      {isLoading && <Text c="dimmed">Chargement...</Text>}

      {logs && logs.length === 0 && (
        <Text c="dimmed" size="sm">
          Aucune activité enregistrée.
        </Text>
      )}

      {logs &&
        logs.map((log) => (
          <Card key={log.id} shadow="xs" padding="sm" radius="sm" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm">
                <Badge variant="light" size="sm">
                  {log.type}
                </Badge>
                {log.duration && (
                  <Text size="sm">{log.duration} min</Text>
                )}
                {log.note && (
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {log.note}
                  </Text>
                )}
              </Group>
              <Group gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {new Date(log.loggedAt).toLocaleString("fr-FR")}
                </Text>
                <Badge size="xs" variant="light">
                  {log.user.name || log.user.email}
                </Badge>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => deleteLog.mutate(log.id)}
                >
                  x
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
    </Stack>
  );
}

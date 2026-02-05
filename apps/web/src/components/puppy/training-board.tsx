import {
  Stack,
  Group,
  Text,
  Badge,
  Progress,
  Card,
  Select,
  ActionIcon,
} from "@mantine/core";
import {
  useTrainingMilestones,
  useUpdateTrainingMilestone,
  useDeleteTrainingMilestone,
} from "../../hooks/use-puppy";
import { TRAINING_STATUSES } from "@personal-os/domain";
import type { TrainingStatus } from "@personal-os/domain";

interface Props {
  householdId: string;
  petId: string;
}

const statusColors: Record<string, string> = {
  not_started: "gray",
  in_progress: "blue",
  learned: "green",
};

const statusOptions = TRAINING_STATUSES.map((s) => ({
  value: s,
  label: s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
}));

export function TrainingBoard({ householdId, petId }: Props) {
  const { data: milestones, isLoading } = useTrainingMilestones(
    householdId,
    petId,
  );
  const updateMilestone = useUpdateTrainingMilestone(householdId, petId);
  const deleteMilestone = useDeleteTrainingMilestone(householdId, petId);

  if (isLoading) return <Text c="dimmed">Loading...</Text>;

  if (!milestones || milestones.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No training milestones yet. Add your first goal!
      </Text>
    );
  }

  const learned = milestones.filter((m) => m.status === "learned").length;
  const total = milestones.length;
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <Stack>
      <Group gap="sm">
        <Text fw={500}>
          {learned}/{total} commands learned
        </Text>
        <Progress value={progress} size="lg" style={{ flex: 1 }} color="green" />
      </Group>

      {milestones.map((milestone) => (
        <Card key={milestone.id} shadow="xs" padding="sm" radius="sm" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {milestone.command}
                </Text>
                <Badge
                  size="xs"
                  variant="light"
                  color={statusColors[milestone.status] || "gray"}
                >
                  {milestone.status.replace(/_/g, " ")}
                </Badge>
              </Group>
              {milestone.dateAchieved && (
                <Text size="xs" c="dimmed">
                  Learned {new Date(milestone.dateAchieved).toLocaleDateString()}
                </Text>
              )}
              {milestone.notes && (
                <Text size="xs" c="dimmed" mt={2}>
                  {milestone.notes}
                </Text>
              )}
            </div>
            <Group gap="xs" wrap="nowrap">
              <Select
                size="xs"
                data={statusOptions}
                value={milestone.status}
                onChange={(v) =>
                  v &&
                  updateMilestone.mutate({
                    id: milestone.id,
                    status: v as TrainingStatus,
                  })
                }
                style={{ width: 130 }}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => deleteMilestone.mutate(milestone.id)}
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

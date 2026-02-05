import {
  Card,
  Group,
  Text,
  Badge,
  Stack,
  Progress,
  SimpleGrid,
} from "@mantine/core";
import { usePetDashboard } from "../../hooks/use-puppy";
import { computeTimeSince } from "@personal-os/domain";

interface Props {
  householdId: string;
  petId: string;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams} g`;
}

export function PetDashboardSummary({ householdId, petId }: Props) {
  const { data: dashboard, isLoading } = usePetDashboard(householdId, petId);

  if (isLoading || !dashboard) return null;

  const { pet, latestWeight, trainingProgress, upcomingReminders, todayChecklist, lastActivity } = dashboard;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {/* Age & Stage */}
      <Card shadow="xs" padding="sm" radius="sm" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Age
        </Text>
        <Text size="lg" fw={500}>
          {pet.age || "Unknown"}
        </Text>
        <Badge size="sm" variant="light" mt={4}>
          {pet.growthStage}
        </Badge>
      </Card>

      {/* Weight */}
      <Card shadow="xs" padding="sm" radius="sm" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Weight
        </Text>
        <Text size="lg" fw={500}>
          {latestWeight ? formatWeight(latestWeight.weight) : "Not logged"}
        </Text>
        {latestWeight && (
          <Text size="xs" c="dimmed" mt={4}>
            as of {new Date(latestWeight.date).toLocaleDateString()}
          </Text>
        )}
      </Card>

      {/* Training Progress */}
      <Card shadow="xs" padding="sm" radius="sm" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Training
        </Text>
        <Group gap="xs" mt={4}>
          <Text size="lg" fw={500}>
            {trainingProgress.learned}/{trainingProgress.total}
          </Text>
          <Text size="sm" c="dimmed">
            learned
          </Text>
        </Group>
        <Progress
          value={trainingProgress.percentage}
          size="sm"
          color="green"
          mt={8}
        />
      </Card>

      {/* Today Checklist */}
      <Card shadow="xs" padding="sm" radius="sm" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Today
        </Text>
        <Group gap="xs" mt={4}>
          <Text size="lg" fw={500}>
            {todayChecklist.completed}/{todayChecklist.total}
          </Text>
          <Text size="sm" c="dimmed">
            tasks done
          </Text>
        </Group>
        <Progress
          value={
            todayChecklist.total > 0
              ? (todayChecklist.completed / todayChecklist.total) * 100
              : 0
          }
          size="sm"
          color={
            todayChecklist.completed === todayChecklist.total && todayChecklist.total > 0
              ? "green"
              : "blue"
          }
          mt={8}
        />
      </Card>

      {/* Last Activity */}
      {(lastActivity.walk || lastActivity.meal) && (
        <Card shadow="xs" padding="sm" radius="sm" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            Last Activity
          </Text>
          <Stack gap={4} mt={4}>
            {lastActivity.walk && (
              <Text size="sm">
                Walk: {computeTimeSince(lastActivity.walk.loggedAt)}
              </Text>
            )}
            {lastActivity.meal && (
              <Text size="sm">
                Meal: {computeTimeSince(lastActivity.meal.loggedAt)}
              </Text>
            )}
          </Stack>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card shadow="xs" padding="sm" radius="sm" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            Upcoming
          </Text>
          <Stack gap={4} mt={4}>
            {upcomingReminders.slice(0, 2).map((r, i) => (
              <Group key={i} gap="xs">
                <Badge size="xs" variant="light" color={r.type === "vet" ? "blue" : "orange"}>
                  {r.type}
                </Badge>
                <Text size="xs" lineClamp={1}>
                  {r.name} - {r.date ? new Date(r.date).toLocaleDateString() : ""}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </SimpleGrid>
  );
}

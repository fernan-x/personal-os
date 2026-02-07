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
import { ACTIVITY_TYPE_LABELS_FR } from "../../lib/labels";

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
          Âge
        </Text>
        <Text size="lg" fw={500}>
          {pet.age || "Inconnu"}
        </Text>
        <Badge size="sm" variant="light" mt={4}>
          {pet.growthStage}
        </Badge>
      </Card>

      {/* Weight */}
      <Card shadow="xs" padding="sm" radius="sm" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Poids
        </Text>
        <Text size="lg" fw={500}>
          {latestWeight ? formatWeight(latestWeight.weight) : "Non renseigné"}
        </Text>
        {latestWeight && (
          <Text size="xs" c="dimmed" mt={4}>
            au {new Date(latestWeight.date).toLocaleDateString("fr-FR")}
          </Text>
        )}
      </Card>

      {/* Training Progress */}
      <Card shadow="xs" padding="sm" radius="sm" withBorder>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Dressage
        </Text>
        <Group gap="xs" mt={4}>
          <Text size="lg" fw={500}>
            {trainingProgress.learned}/{trainingProgress.total}
          </Text>
          <Text size="sm" c="dimmed">
            acquis
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
          Aujourd'hui
        </Text>
        <Group gap="xs" mt={4}>
          <Text size="lg" fw={500}>
            {todayChecklist.completed}/{todayChecklist.total}
          </Text>
          <Text size="sm" c="dimmed">
            tâches faites
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
            Dernière activité
          </Text>
          <Stack gap={4} mt={4}>
            {lastActivity.walk && (
              <Text size="sm">
                Promenade : {computeTimeSince(lastActivity.walk.loggedAt)}
              </Text>
            )}
            {lastActivity.meal && (
              <Text size="sm">
                Repas : {computeTimeSince(lastActivity.meal.loggedAt)}
              </Text>
            )}
          </Stack>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card shadow="xs" padding="sm" radius="sm" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            À venir
          </Text>
          <Stack gap={4} mt={4}>
            {upcomingReminders.slice(0, 2).map((r, i) => (
              <Group key={i} gap="xs">
                <Badge size="xs" variant="light" color={r.type === "vet" ? "blue" : "orange"}>
                  {r.type === "vet" ? "véto" : r.type}
                </Badge>
                <Text size="xs" lineClamp={1}>
                  {r.name} - {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : ""}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </SimpleGrid>
  );
}

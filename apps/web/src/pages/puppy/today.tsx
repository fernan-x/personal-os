import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router";
import { useTodayChecklist } from "../../hooks/use-puppy";
import { ChecklistCard } from "../../components/puppy/checklist-card";

export function TodayPage() {
  const { householdId } = useParams<{ householdId: string }>();
  const navigate = useNavigate();
  const { data: todayData, isLoading, error } = useTodayChecklist(householdId!);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        {error.message}
      </Alert>
    );
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title>Today</Title>
          <Text c="dimmed">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </div>
        <Button
          variant="subtle"
          onClick={() => navigate(`/puppy/${householdId}`)}
        >
          Back to household
        </Button>
      </Group>

      {todayData && todayData.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No pets in this household yet.
        </Text>
      )}

      {todayData &&
        todayData.map(({ pet, items }) => (
          <ChecklistCard
            key={pet.id}
            pet={pet}
            items={items}
            householdId={householdId!}
          />
        ))}
    </Stack>
  );
}

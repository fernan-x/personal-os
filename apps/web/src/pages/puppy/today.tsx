import {
  Text,
  Stack,
  Loader,
  Center,
  Alert,
  ActionIcon,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router";
import { IconSun, IconArrowLeft } from "@tabler/icons-react";
import { useTodayChecklist } from "../../hooks/use-puppy";
import { ChecklistCard } from "../../components/puppy/checklist-card";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";

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
      <PageHeader
        title="Aujourd'hui"
        subtitle={new Date().toLocaleDateString('fr-FR', {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        icon={IconSun}
        backButton={
          <ActionIcon variant="subtle" onClick={() => navigate(`/puppy/${householdId}`)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
      />

      {todayData && todayData.length === 0 && (
        <EmptyState
          icon={IconSun}
          title="Aucun animal"
          description="Pas encore d'animaux dans ce foyer."
        />
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

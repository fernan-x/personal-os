import { useState } from "react";
import {
  Stack,
  Alert,
  Loader,
  Center,
  Group,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router";
import type { MealSlot } from "@personal-os/domain";
import { useMealPlan, useDeleteMealPlanEntry } from "../../hooks/use-meals";
import type { MealPlanEntryDetail } from "../../hooks/use-meals";
import { PageHeader } from "../../components/shared/page-header";
import { MealPlanGrid } from "../../components/meals/meal-plan-grid";
import { RecipePickerModal } from "../../components/meals/recipe-picker-modal";
import { EntryDetailModal } from "../../components/meals/entry-detail-modal";
import dayjs from "dayjs";
import "dayjs/locale/fr";

interface PickerState {
  date: string;
  slot: MealSlot;
}

export function MealPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { data: plan, isLoading, error } = useMealPlan(planId!);
  const deleteEntry = useDeleteMealPlanEntry();
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MealPlanEntryDetail | null>(null);

  function handleDeleteEntry(entryId: string) {
    deleteEntry.mutate({ planId: planId!, entryId });
  }

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Erreur de chargement">
        {error.message}
      </Alert>
    );
  }

  if (!plan) return null;

  const planStartDate = (plan.startDate as unknown as string).slice(0, 10);
  const planEndDate = (plan.endDate as unknown as string).slice(0, 10);

  return (
    <Stack>
      <PageHeader
        icon={IconCalendar}
        title={plan.name}
        backButton={
          <ActionIcon
            variant="subtle"
            onClick={() => navigate("/meals/plans")}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
        actions={
          <Group gap="xs">
            <Badge size="lg" variant="light" color="blue">
              {dayjs(plan.startDate).locale("fr").format("D MMM")} – {dayjs(plan.endDate).locale("fr").format("D MMM YYYY")}
            </Badge>
          </Group>
        }
      />

      <MealPlanGrid
        plan={plan}
        onAddRecipe={(date, slot) => setPicker({ date, slot })}
        onDeleteEntry={handleDeleteEntry}
        onEntryClick={setSelectedEntry}
      />

      {picker && (
        <RecipePickerModal
          opened={!!picker}
          onClose={() => setPicker(null)}
          planId={planId!}
          initialDate={picker.date}
          initialSlot={picker.slot}
          planStartDate={planStartDate}
          planEndDate={planEndDate}
        />
      )}

      <EntryDetailModal
        entry={selectedEntry}
        opened={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </Stack>
  );
}

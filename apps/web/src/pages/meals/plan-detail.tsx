import { useState } from "react";
import {
  Stack,
  Alert,
  Loader,
  Center,
  Group,
  Badge,
  ActionIcon,
  Card,
  Text,
  List,
  Title,
  Button,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCalendar,
  IconAlertTriangle,
  IconToolsKitchen2,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router";
import type { MealSlot, Gender, ActivityLevel, FitnessGoal } from "@personal-os/domain";
import { computeDailyTargets } from "@personal-os/domain";
import { useMealPlan, useDeleteMealPlanEntry, useUpdateMealPlanEntry } from "../../hooks/use-meals";
import type { MealPlanDetail, MealPlanEntryDetail } from "../../hooks/use-meals";
import { useNutritionalProfile } from "../../hooks/use-user";
import { PageHeader } from "../../components/shared/page-header";
import { MealPlanGrid } from "../../components/meals/meal-plan-grid";
import { DailyMacroSummary } from "../../components/meals/daily-macro-summary";
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
  const updateEntry = useUpdateMealPlanEntry();
  const { data: profile } = useNutritionalProfile();
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MealPlanEntryDetail | null>(null);

  const profileComplete =
    profile?.weight != null &&
    profile?.height != null &&
    profile?.birthDate != null &&
    profile?.gender != null &&
    profile?.activityLevel != null &&
    profile?.fitnessGoal != null;

  const dailyTargets = profileComplete
    ? computeDailyTargets(
        profile!.weight!,
        profile!.height!,
        new Date(profile!.birthDate!),
        profile!.gender as Gender,
        profile!.activityLevel as ActivityLevel,
        profile!.fitnessGoal as FitnessGoal,
      )
    : null;

  function handleDeleteEntry(entryId: string) {
    deleteEntry.mutate({ planId: planId!, entryId });
  }

  function handleMoveEntry(entryId: string, date: string, slot: MealSlot) {
    updateEntry.mutate({ planId: planId!, entryId, date, slot });
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
            <Button
              variant="light"
              size="xs"
              leftSection={<IconShoppingCart size={16} />}
              onClick={() => navigate(`/meals/plans/${planId}/grocery`)}
            >
              Liste de courses
            </Button>
            <Badge size="lg" variant="light" color="blue">
              {dayjs(plan.startDate).locale("fr").format("D MMM")} – {dayjs(plan.endDate).locale("fr").format("D MMM YYYY")}
            </Badge>
          </Group>
        }
      />

      {plan.warnings && plan.warnings.length > 0 && (
        <Alert
          icon={<IconAlertTriangle size={18} />}
          title="Avertissements"
          color="orange"
          variant="light"
        >
          <List size="sm" spacing={4}>
            {plan.warnings.map((warning, i) => (
              <List.Item key={i}>{warning}</List.Item>
            ))}
          </List>
        </Alert>
      )}

      <DailyMacroSummary plan={plan} dailyTargets={dailyTargets} />

      <CookingSummary plan={plan} />

      <MealPlanGrid
        plan={plan}
        onAddRecipe={(date, slot) => setPicker({ date, slot })}
        onDeleteEntry={handleDeleteEntry}
        onEntryClick={setSelectedEntry}
        onMoveEntry={handleMoveEntry}
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

function CookingSummary({ plan }: { plan: MealPlanDetail }) {
  if (plan.entries.length === 0) return null;

  // Group by recipe, sum total servings
  const recipeMap = new Map<
    string,
    { title: string; batchSize: number; totalServings: number }
  >();

  for (const entry of plan.entries) {
    const existing = recipeMap.get(entry.recipe.id);
    if (existing) {
      existing.totalServings += entry.servings;
    } else {
      recipeMap.set(entry.recipe.id, {
        title: entry.recipe.title,
        batchSize: entry.recipe.servings,
        totalServings: entry.servings,
      });
    }
  }

  const items = Array.from(recipeMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return (
    <Card withBorder padding="md" radius="md">
      <Group gap="xs" mb="sm">
        <IconToolsKitchen2 size={18} />
        <Title order={5}>Preparation</Title>
      </Group>
      <List size="sm" spacing={4}>
        {items.map((item) => {
          const batches = Math.ceil(item.totalServings / item.batchSize);
          return (
            <List.Item key={item.title}>
              <Text size="sm" component="span">
                <Text component="span" fw={600}>
                  {item.title}
                </Text>
                {" — "}
                {item.totalServings} portion{item.totalServings > 1 ? "s" : ""}
                {batches > 1
                  ? ` (${batches} fournees de ${item.batchSize})`
                  : ` (${batches} fournee de ${item.batchSize})`}
              </Text>
            </List.Item>
          );
        })}
      </List>
    </Card>
  );
}

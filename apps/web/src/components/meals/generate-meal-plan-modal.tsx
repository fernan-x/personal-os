import { useState } from "react";
import {
  Modal,
  Stepper,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Checkbox,
  Text,
  MultiSelect,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useNavigate } from "react-router";
import {
  MEAL_SLOT_LABELS,
  MEAL_SLOTS,
  computeDailyTargets,
  type MealSlot,
  type Gender,
  type ActivityLevel,
  type FitnessGoal,
} from "@personal-os/domain";
import { useGenerateMealPlan, useTags } from "../../hooks/use-meals";
import { useNutritionalProfile } from "../../hooks/use-user";
import { MacrosDisplay } from "./macros-display";
import dayjs from "dayjs";

interface GenerateMealPlanModalProps {
  opened: boolean;
  onClose: () => void;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function GenerateMealPlanModal({
  opened,
  onClose,
}: GenerateMealPlanModalProps) {
  const navigate = useNavigate();
  const generatePlan = useGenerateMealPlan();
  const { data: profile } = useNutritionalProfile();
  const { data: tags } = useTags();

  const monday = getMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const [active, setActive] = useState(0);
  const [name, setName] = useState("Plan auto");
  const [startDate, setStartDate] = useState<Date | null>(monday);
  const [endDate, setEndDate] = useState<Date | null>(sunday);
  const [slots, setSlots] = useState<MealSlot[]>(["breakfast", "lunch", "dinner"]);
  const [calorieTarget, setCalorieTarget] = useState<number | string>("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<number | string>("");

  const profileComplete =
    profile?.weight != null &&
    profile?.height != null &&
    profile?.birthDate != null &&
    profile?.gender != null &&
    profile?.activityLevel != null &&
    profile?.fitnessGoal != null;

  const computedTargets = profileComplete
    ? computeDailyTargets(
        profile!.weight!,
        profile!.height!,
        new Date(profile!.birthDate!),
        profile!.gender as Gender,
        profile!.activityLevel as ActivityLevel,
        profile!.fitnessGoal as FitnessGoal,
      )
    : null;

  function handleSlotToggle(slot: MealSlot, checked: boolean) {
    setSlots((prev) =>
      checked ? [...prev, slot] : prev.filter((s) => s !== slot),
    );
  }

  function handleGenerate() {
    if (!startDate || !endDate || slots.length === 0) return;

    generatePlan.mutate(
      {
        name: name.trim() || "Plan auto",
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        endDate: dayjs(endDate).format("YYYY-MM-DD"),
        slots,
        calorieTarget:
          typeof calorieTarget === "number" ? calorieTarget : undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        maxPrepTime:
          typeof maxPrepTime === "number" ? maxPrepTime : undefined,
      },
      {
        onSuccess: (plan) => {
          onClose();
          navigate(`/meals/plans/${plan.id}`);
        },
      },
    );
  }

  const canNext =
    active === 0
      ? !!startDate && !!endDate
      : active === 1
        ? slots.length > 0
        : true;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Generer un plan de repas"
      size="lg"
    >
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Dates">
          <Stack gap="md" mt="md">
            <TextInput
              label="Nom du plan"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Plan auto"
            />
            <Group grow>
              <DateInput
                label="Date de debut"
                value={startDate}
                onChange={setStartDate}
                required
              />
              <DateInput
                label="Date de fin"
                value={endDate}
                onChange={setEndDate}
                required
              />
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Repas">
          <Stack gap="md" mt="md">
            <Text size="sm" c="dimmed">
              Selectionnez les repas a planifier
            </Text>
            {MEAL_SLOTS.map((slot) => (
              <Checkbox
                key={slot}
                label={MEAL_SLOT_LABELS[slot]}
                checked={slots.includes(slot as MealSlot)}
                onChange={(e) =>
                  handleSlotToggle(slot as MealSlot, e.currentTarget.checked)
                }
              />
            ))}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Objectifs">
          <Stack gap="md" mt="md">
            {computedTargets && (
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Objectifs journaliers (profil nutritionnel)
                </Text>
                <MacrosDisplay
                  calories={computedTargets.calories}
                  protein={computedTargets.protein}
                  carbs={computedTargets.carbs}
                  fat={computedTargets.fat}
                  size="md"
                />
              </div>
            )}

            <NumberInput
              label="Objectif calorique (override)"
              description="Laisser vide pour utiliser le profil nutritionnel"
              value={calorieTarget}
              onChange={setCalorieTarget}
              min={800}
              max={10000}
              suffix=" kcal"
            />

            {tags && tags.length > 0 && (
              <MultiSelect
                label="Filtrer par tags"
                data={tags.map((t) => ({ value: t.id, label: t.name }))}
                value={tagIds}
                onChange={setTagIds}
                clearable
                searchable
              />
            )}

            <NumberInput
              label="Temps de preparation max"
              value={maxPrepTime}
              onChange={setMaxPrepTime}
              min={1}
              suffix=" min"
            />
          </Stack>
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
        >
          Retour
        </Button>
        {active < 2 ? (
          <Button
            onClick={() => setActive((a) => a + 1)}
            disabled={!canNext}
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            loading={generatePlan.isPending}
            disabled={!canNext}
          >
            Generer
          </Button>
        )}
      </Group>
    </Modal>
  );
}

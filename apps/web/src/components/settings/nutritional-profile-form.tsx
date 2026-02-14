import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Stack,
  Group,
  NumberInput,
  Select,
  Button,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  GENDERS,
  GENDER_LABELS,
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_LABELS,
  FITNESS_GOALS,
  FITNESS_GOAL_LABELS,
  computeDailyTargets,
  type Gender,
  type ActivityLevel,
  type FitnessGoal,
} from "@personal-os/domain";
import {
  useNutritionalProfile,
  useUpdateNutrition,
} from "../../hooks/use-user";
import { MacrosDisplay } from "../meals/macros-display";

export function NutritionalProfileForm() {
  const { data: profile } = useNutritionalProfile();
  const updateNutrition = useUpdateNutrition();

  const [weight, setWeight] = useState<number | string>("");
  const [height, setHeight] = useState<number | string>("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [fitnessGoal, setFitnessGoal] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setWeight(profile.weight ?? "");
      setHeight(profile.height ?? "");
      setBirthDate(profile.birthDate ? new Date(profile.birthDate) : null);
      setGender(profile.gender);
      setActivityLevel(profile.activityLevel);
      setFitnessGoal(profile.fitnessGoal);
    }
  }, [profile]);

  const allFilled =
    typeof weight === "number" &&
    weight > 0 &&
    typeof height === "number" &&
    height > 0 &&
    birthDate != null &&
    gender != null &&
    activityLevel != null &&
    fitnessGoal != null;

  const targets = allFilled
    ? computeDailyTargets(
        weight as number,
        height as number,
        birthDate!,
        gender as Gender,
        activityLevel as ActivityLevel,
        fitnessGoal as FitnessGoal,
      )
    : null;

  function handleSave() {
    updateNutrition.mutate({
      weight: typeof weight === "number" ? weight : null,
      height: typeof height === "number" ? height : null,
      birthDate: birthDate ? birthDate.toISOString().slice(0, 10) : null,
      gender: (gender as Gender) ?? null,
      activityLevel: (activityLevel as ActivityLevel) ?? null,
      fitnessGoal: (fitnessGoal as FitnessGoal) ?? null,
    });
  }

  return (
    <Card>
      <Text fw={600} size="lg" mb="md">
        Profil nutritionnel
      </Text>
      <Stack gap="md">
        <Group grow>
          <NumberInput
            label="Poids (kg)"
            value={weight}
            onChange={setWeight}
            min={1}
            max={500}
            decimalScale={1}
          />
          <NumberInput
            label="Taille (cm)"
            value={height}
            onChange={setHeight}
            min={1}
            max={300}
            decimalScale={0}
          />
        </Group>

        <DateInput
          label="Date de naissance"
          value={birthDate}
          onChange={setBirthDate}
          maxDate={new Date()}
        />

        <Select
          label="Genre"
          value={gender}
          onChange={setGender}
          data={GENDERS.map((g) => ({
            value: g,
            label: GENDER_LABELS[g],
          }))}
          clearable
        />

        <Select
          label="Niveau d'activite"
          value={activityLevel}
          onChange={setActivityLevel}
          data={ACTIVITY_LEVELS.map((a) => ({
            value: a,
            label: ACTIVITY_LEVEL_LABELS[a],
          }))}
          clearable
        />

        <Select
          label="Objectif"
          value={fitnessGoal}
          onChange={setFitnessGoal}
          data={FITNESS_GOALS.map((g) => ({
            value: g,
            label: FITNESS_GOAL_LABELS[g],
          }))}
          clearable
        />

        {targets && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              Objectifs journaliers calcules
            </Text>
            <MacrosDisplay
              calories={targets.calories}
              protein={targets.protein}
              carbs={targets.carbs}
              fat={targets.fat}
              size="md"
            />
          </div>
        )}

        <Group>
          <Button onClick={handleSave} loading={updateNutrition.isPending}>
            Enregistrer
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

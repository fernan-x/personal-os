import { useEffect } from "react";
import { Button, Chip, Group, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import {
  HABIT_FREQUENCIES,
  HABIT_NAME_MAX_LENGTH,
  HABIT_DESCRIPTION_MAX_LENGTH,
  validateUpdateHabit,
} from "@personal-os/domain";
import type { Habit, HabitFrequency, UpdateHabitInput } from "@personal-os/domain";
import { useUpdateHabit, useDeleteHabit } from "../../hooks/use-habits";
import { FREQUENCY_LABELS_FR, DAY_LABELS_SHORT_FR } from "../../lib/labels";

interface EditHabitModalProps {
  habit: Habit | null;
  opened: boolean;
  onClose: () => void;
}

export function EditHabitModal({ habit, opened, onClose }: EditHabitModalProps) {
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const form = useForm<UpdateHabitInput>({
    initialValues: {
      name: "",
      description: "",
      frequency: "daily",
      customDays: [],
    },
    validate: (values) => {
      const errors = validateUpdateHabit(values);
      const fieldErrors: Record<string, string> = {};
      for (const error of errors) {
        fieldErrors[error.field] = error.message;
      }
      return fieldErrors;
    },
  });

  useEffect(() => {
    if (habit) {
      form.setValues({
        name: habit.name,
        description: habit.description ?? "",
        frequency: habit.frequency,
        customDays: habit.customDays ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit]);

  function handleSubmit(values: UpdateHabitInput) {
    if (!habit) return;

    updateHabit.mutate(
      { id: habit.id, ...values },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  function handleDelete() {
    if (!habit) return;

    deleteHabit.mutate(habit.id, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Modifier l'habitude">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nom"
            placeholder="ex. Méditation matinale"
            maxLength={HABIT_NAME_MAX_LENGTH}
            required
            {...form.getInputProps("name")}
          />
          <Textarea
            label="Description"
            placeholder="Description optionnelle"
            maxLength={HABIT_DESCRIPTION_MAX_LENGTH}
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps("description")}
          />
          <Select
            label="Fréquence"
            data={HABIT_FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABELS_FR[f] || f }))}
            {...form.getInputProps("frequency")}
            onChange={(value) => {
              const freq = (value ?? "daily") as HabitFrequency;
              form.setFieldValue("frequency", freq);
              if (freq !== "custom") form.setFieldValue("customDays", []);
            }}
          />
          {form.values.frequency === "custom" && (
            <Chip.Group
              multiple
              value={form.values.customDays?.map(String) ?? []}
              onChange={(values: string[]) =>
                form.setFieldValue(
                  "customDays",
                  values.map(Number).sort((a, b) => a - b),
                )
              }
            >
              <Group gap="xs">
                {([1, 2, 3, 4, 5, 6, 7] as const).map((day) => (
                  <Chip key={day} value={String(day)} size="sm">
                    {DAY_LABELS_SHORT_FR[day]}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          )}
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              loading={deleteHabit.isPending}
            >
              Supprimer
            </Button>
            <Button type="submit" loading={updateHabit.isPending} leftSection={<IconCheck size={16} />}>
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

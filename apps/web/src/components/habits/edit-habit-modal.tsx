import { useEffect } from "react";
import { Button, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  HABIT_FREQUENCIES,
  HABIT_NAME_MAX_LENGTH,
  HABIT_DESCRIPTION_MAX_LENGTH,
  validateUpdateHabit,
} from "@personal-os/domain";
import type { Habit, HabitFrequency, UpdateHabitInput } from "@personal-os/domain";
import { useUpdateHabit } from "../../hooks/use-habits";

interface EditHabitModalProps {
  habit: Habit | null;
  opened: boolean;
  onClose: () => void;
}

export function EditHabitModal({ habit, opened, onClose }: EditHabitModalProps) {
  const updateHabit = useUpdateHabit();

  const form = useForm<UpdateHabitInput>({
    initialValues: {
      name: "",
      description: "",
      frequency: "daily",
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
            data={HABIT_FREQUENCIES.map((f) => ({ value: f, label: f }))}
            {...form.getInputProps("frequency")}
            onChange={(value) =>
              form.setFieldValue("frequency", (value ?? "daily") as HabitFrequency)
            }
          />
          <Button type="submit" loading={updateHabit.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

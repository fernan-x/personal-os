import { Button, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  HABIT_FREQUENCIES,
  HABIT_NAME_MAX_LENGTH,
  HABIT_DESCRIPTION_MAX_LENGTH,
  validateCreateHabit,
} from "@personal-os/domain";
import type { CreateHabitInput, HabitFrequency } from "@personal-os/domain";
import { useCreateHabit } from "../../hooks/use-habits";
import { FREQUENCY_LABELS_FR } from "../../lib/labels";

interface CreateHabitModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateHabitModal({ opened, onClose }: CreateHabitModalProps) {
  const createHabit = useCreateHabit();

  const form = useForm<CreateHabitInput>({
    initialValues: {
      name: "",
      description: "",
      frequency: "daily",
    },
    validate: (values) => {
      const errors = validateCreateHabit(values);
      const fieldErrors: Record<string, string> = {};
      for (const error of errors) {
        fieldErrors[error.field] = error.message;
      }
      return fieldErrors;
    },
  });

  function handleSubmit(values: CreateHabitInput) {
    createHabit.mutate(values, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Nouvelle habitude">
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
            onChange={(value) =>
              form.setFieldValue("frequency", (value ?? "daily") as HabitFrequency)
            }
          />
          <Button type="submit" loading={createHabit.isPending}>
            Créer l'habitude
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

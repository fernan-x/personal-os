import { useState } from "react";
import { Modal, TextInput, Button, Group, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useNavigate } from "react-router";
import { useCreateMealPlan } from "../../hooks/use-meals";
import dayjs from "dayjs";

interface CreateMealPlanModalProps {
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

export function CreateMealPlanModal({
  opened,
  onClose,
}: CreateMealPlanModalProps) {
  const navigate = useNavigate();
  const createPlan = useCreateMealPlan();
  const monday = getMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const [name, setName] = useState("Plan de la semaine");
  const [startDate, setStartDate] = useState<Date | null>(monday);
  const [endDate, setEndDate] = useState<Date | null>(sunday);

  function handleSubmit() {
    if (!name.trim() || !startDate || !endDate) return;

    createPlan.mutate(
      {
        name: name.trim(),
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        endDate: dayjs(endDate).format("YYYY-MM-DD"),
      },
      {
        onSuccess: (plan) => {
          onClose();
          navigate(`/meals/plans/${plan.id}`);
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Nouveau plan de repas">
      <Stack gap="md">
        <TextInput
          label="Nom"
          placeholder="Plan de la semaine"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <Group grow>
          <DateInput
            label="Date de début"
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
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createPlan.isPending}
            disabled={!name.trim() || !startDate || !endDate}
          >
            Créer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

import {
  Modal,
  NumberInput,
  Button,
  Stack,
  Switch,
  Select,
} from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateMonthlyPlan } from "../../hooks/use-budget";

interface Props {
  groupId: string;
  opened: boolean;
  onClose: () => void;
}

const MONTHS = [
  { value: "1", label: "Janvier" },
  { value: "2", label: "Février" },
  { value: "3", label: "Mars" },
  { value: "4", label: "Avril" },
  { value: "5", label: "Mai" },
  { value: "6", label: "Juin" },
  { value: "7", label: "Juillet" },
  { value: "8", label: "Août" },
  { value: "9", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

export function CreatePlanModal({ groupId, opened, onClose }: Props) {
  const now = new Date();
  const [month, setMonth] = useState<string | null>(
    String(now.getMonth() + 1),
  );
  const [year, setYear] = useState<number | string>(now.getFullYear());
  const [prefill, setPrefill] = useState(true);
  const createPlan = useCreateMonthlyPlan(groupId);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createPlan.mutate(
      {
        month: Number(month),
        year: Number(year),
        prefillFromPrevious: prefill,
      },
      {
        onSuccess: (plan) => {
          onClose();
          navigate(`/budget/${groupId}/plans/${plan.id}`);
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Nouveau plan mensuel">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Mois"
            data={MONTHS}
            value={month}
            onChange={setMonth}
            required
          />
          <NumberInput
            label="Année"
            value={year}
            onChange={setYear}
            min={2000}
            max={2100}
            required
          />
          <Switch
            label="Pré-remplir depuis le mois précédent"
            checked={prefill}
            onChange={(e) => setPrefill(e.currentTarget.checked)}
          />
          <Button type="submit" loading={createPlan.isPending}>
            Créer le plan
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

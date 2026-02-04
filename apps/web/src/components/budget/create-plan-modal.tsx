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
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
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
    <Modal opened={opened} onClose={onClose} title="New Monthly Plan">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Month"
            data={MONTHS}
            value={month}
            onChange={setMonth}
            required
          />
          <NumberInput
            label="Year"
            value={year}
            onChange={setYear}
            min={2000}
            max={2100}
            required
          />
          <Switch
            label="Pre-fill from previous month"
            checked={prefill}
            onChange={(e) => setPrefill(e.currentTarget.checked)}
          />
          <Button type="submit" loading={createPlan.isPending}>
            Create Plan
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

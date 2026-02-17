import { Modal, Select, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { IconDownload } from "@tabler/icons-react";
import { useMonthlyPlans } from "../../hooks/use-budget";
import { useImportEnvelopes } from "../../hooks/use-envelopes";

const MONTH_NAMES = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface Props {
  groupId: string;
  planId: string;
  opened: boolean;
  onClose: () => void;
}

export function ImportEnvelopesModal({ groupId, planId, opened, onClose }: Props) {
  const [sourcePlanId, setSourcePlanId] = useState<string | null>(null);
  const { data: plans } = useMonthlyPlans(groupId);
  const importEnvelopes = useImportEnvelopes(groupId, planId);

  const planOptions =
    plans
      ?.filter((p) => p.id !== planId)
      .map((p) => ({
        value: p.id,
        label: `${MONTH_NAMES[p.month]} ${p.year}`,
      })) ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourcePlanId) return;
    importEnvelopes.mutate(
      { sourcePlanId },
      {
        onSuccess: () => {
          setSourcePlanId(null);
          onClose();
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Importer les enveloppes">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Plan source"
            data={planOptions}
            value={sourcePlanId}
            onChange={setSourcePlanId}
            required
            placeholder="Sélectionner un plan"
          />
          <Button
            type="submit"
            loading={importEnvelopes.isPending}
            leftSection={<IconDownload size={16} />}
          >
            Importer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

import { Modal, Select, Stack, Button, Group } from "@mantine/core";
import { useState, useEffect } from "react";
import { WIDGET_TYPE_LABELS } from "@personal-os/domain";
import type { WidgetType } from "@personal-os/domain";
import { useBudgetGroups } from "../../hooks/use-budget";
import { useHouseholds } from "../../hooks/use-puppy";

interface Props {
  opened: boolean;
  onClose: () => void;
  widgetType: WidgetType | null;
  initialConfig?: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
}

export function WidgetConfigModal({
  opened,
  onClose,
  widgetType,
  initialConfig,
  onSave,
}: Props) {
  const [config, setConfig] = useState<Record<string, unknown>>(
    initialConfig ?? {},
  );

  const { data: groups } = useBudgetGroups();
  const { data: households } = useHouseholds();

  useEffect(() => {
    setConfig(initialConfig ?? {});
  }, [initialConfig, widgetType]);

  if (!widgetType) return null;

  const selectedHousehold = households?.find(
    (h) => h.id === config.householdId,
  );

  function handleSave() {
    onSave(config);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Configurer : ${WIDGET_TYPE_LABELS[widgetType]}`}
    >
      <Stack>
        {widgetType === "habit_evolution" && (
          <Select
            label="Période"
            value={(config.period as string) || "weekly"}
            onChange={(v) => setConfig({ ...config, period: v || "weekly" })}
            data={[
              { value: "weekly", label: "Semaine" },
              { value: "monthly", label: "Mois" },
            ]}
          />
        )}

        {widgetType === "budget_summary" && (
          <Select
            label="Groupe budgétaire"
            placeholder="Sélectionnez un groupe"
            value={(config.groupId as string) || null}
            onChange={(v) => setConfig({ ...config, groupId: v || "" })}
            data={
              groups?.map((g) => ({ value: g.id, label: g.name })) ?? []
            }
          />
        )}

        {(widgetType === "pet_today_activities" ||
          widgetType === "pet_activities" ||
          widgetType === "pet_weight_evolution") && (
          <>
            <Select
              label="Foyer"
              placeholder="Sélectionnez un foyer"
              value={(config.householdId as string) || null}
              onChange={(v) =>
                setConfig({ ...config, householdId: v || "", petId: "" })
              }
              data={
                households?.map((h) => ({ value: h.id, label: h.name })) ?? []
              }
            />
            <Select
              label="Animal"
              placeholder="Sélectionnez un animal"
              value={(config.petId as string) || null}
              onChange={(v) => setConfig({ ...config, petId: v || "" })}
              data={
                selectedHousehold?.pets.map((p) => ({
                  value: p.id,
                  label: p.name,
                })) ?? []
              }
              disabled={!config.householdId}
            />
          </>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

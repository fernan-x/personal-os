import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Alert,
  Stepper,
} from "@mantine/core";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMonthlyPlan } from "../../hooks/use-budget";
import { IncomeStep } from "../../components/budget/income-step";
import { ExpenseStep } from "../../components/budget/expense-step";
import { SummaryView } from "../../components/budget/summary-view";

const MONTH_NAMES = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function BudgetPlanPage() {
  const { groupId, planId } = useParams<{
    groupId: string;
    planId: string;
  }>();
  const navigate = useNavigate();
  const { data: plan, isLoading, error } = useMonthlyPlan(groupId!, planId!);
  const [step, setStep] = useState(0);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error || !plan) {
    return <Alert color="red">Plan non trouvé</Alert>;
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>
            {MONTH_NAMES[plan.month]} {plan.year}
          </Title>
          <Text c="dimmed">Planifiez votre budget mensuel étape par étape.</Text>
        </div>
        <Group>
          <Button
            variant="subtle"
            onClick={() => navigate(`/budget/${groupId}`)}
          >
            Retour au groupe
          </Button>
          <Button
            onClick={() =>
              navigate(`/budget/${groupId}/plans/${planId}/tracking`)
            }
          >
            Suivi des dépenses
          </Button>
        </Group>
      </Group>

      <Stepper active={step} onStepClick={setStep}>
        <Stepper.Step label="Revenus" description="Ajoutez vos sources de revenus">
          <IncomeStep groupId={groupId!} plan={plan} />
        </Stepper.Step>

        <Stepper.Step label="Dépenses" description="Planifiez vos dépenses">
          <ExpenseStep groupId={groupId!} plan={plan} />
        </Stepper.Step>

        <Stepper.Step label="Résumé" description="Vérifiez votre plan">
          <SummaryView groupId={groupId!} planId={planId!} />
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="md">
        {step > 0 && (
          <Button variant="default" onClick={() => setStep(step - 1)}>
            Retour
          </Button>
        )}
        {step < 2 && (
          <Button onClick={() => setStep(step + 1)}>Suivant</Button>
        )}
      </Group>
    </Stack>
  );
}

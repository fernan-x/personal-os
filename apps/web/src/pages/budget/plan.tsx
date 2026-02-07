import {
  Text,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Alert,
  Stepper,
  ActionIcon,
} from "@mantine/core";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { IconArrowLeft, IconArrowRight, IconCalendarStats, IconReceipt, IconCash, IconChartBar, IconCheck } from "@tabler/icons-react";
import { useMonthlyPlan } from "../../hooks/use-budget";
import { IncomeStep } from "../../components/budget/income-step";
import { ExpenseStep } from "../../components/budget/expense-step";
import { SummaryView } from "../../components/budget/summary-view";
import { PageHeader } from "../../components/shared/page-header";

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
      <PageHeader
        title={`${MONTH_NAMES[plan.month]} ${plan.year}`}
        subtitle="Planifiez votre budget mensuel étape par étape."
        icon={IconCalendarStats}
        backButton={
          <ActionIcon variant="subtle" onClick={() => navigate(`/budget/${groupId}`)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
        actions={
          <Button
            leftSection={<IconReceipt size={16} />}
            onClick={() =>
              navigate(`/budget/${groupId}/plans/${planId}/tracking`)
            }
          >
            Suivi des dépenses
          </Button>
        }
      />

      <Stepper active={step} onStepClick={setStep}>
        <Stepper.Step label="Revenus" description="Ajoutez vos sources de revenus" icon={<IconCash size={18} />}>
          <IncomeStep groupId={groupId!} plan={plan} />
        </Stepper.Step>

        <Stepper.Step label="Dépenses" description="Planifiez vos dépenses" icon={<IconReceipt size={18} />}>
          <ExpenseStep groupId={groupId!} plan={plan} />
        </Stepper.Step>

        <Stepper.Step label="Résumé" description="Vérifiez votre plan" icon={<IconChartBar size={18} />}>
          <SummaryView groupId={groupId!} planId={planId!} />
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="md">
        {step > 0 && (
          <Button variant="default" onClick={() => setStep(step - 1)} leftSection={<IconArrowLeft size={16} />}>
            Retour
          </Button>
        )}
        {step < 2 && (
          <Button onClick={() => setStep(step + 1)} rightSection={<IconArrowRight size={16} />}>Suivant</Button>
        )}
      </Group>
    </Stack>
  );
}

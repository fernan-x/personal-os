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
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
    return <Alert color="red">Plan not found</Alert>;
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>
            {MONTH_NAMES[plan.month]} {plan.year}
          </Title>
          <Text c="dimmed">Plan your monthly budget step by step.</Text>
        </div>
        <Group>
          <Button
            variant="subtle"
            onClick={() => navigate(`/budget/${groupId}`)}
          >
            Back to group
          </Button>
          <Button
            onClick={() =>
              navigate(`/budget/${groupId}/plans/${planId}/tracking`)
            }
          >
            Track Expenses
          </Button>
        </Group>
      </Group>

      <Stepper active={step} onStepClick={setStep}>
        <Stepper.Step label="Incomes" description="Add income sources">
          <IncomeStep groupId={groupId!} plan={plan} />
        </Stepper.Step>

        <Stepper.Step label="Expenses" description="Plan your expenses">
          <ExpenseStep groupId={groupId!} plan={plan} />
        </Stepper.Step>

        <Stepper.Step label="Summary" description="Review your plan">
          <SummaryView groupId={groupId!} planId={planId!} />
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="md">
        {step > 0 && (
          <Button variant="default" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < 2 && (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        )}
      </Group>
    </Stack>
  );
}

import {
  Stack,
  Button,
  Loader,
  Center,
  Alert,
  Tabs,
  ActionIcon,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router";
import {
  IconArrowLeft,
  IconCalendarStats,
  IconReceipt,
  IconCash,
  IconChartBar,
  IconLayoutDashboard,
  IconCategory,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useMonthlyPlan, usePlanSummary } from "../../hooks/use-budget";
import { IncomeStep } from "../../components/budget/income-step";
import { ExpenseStep } from "../../components/budget/expense-step";
import { SummaryView } from "../../components/budget/summary-view";
import { PlanOverview } from "../../components/budget/plan-overview";
import { CategoryManagementModal } from "../../components/budget/category-management-modal";
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
  const { data: summary } = usePlanSummary(groupId!, planId!);
  const [categoryOpened, { open: openCategory, close: closeCategory }] = useDisclosure(false);

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
        subtitle="Planifiez votre budget mensuel."
        icon={IconCalendarStats}
        backButton={
          <ActionIcon variant="subtle" onClick={() => navigate(`/budget/${groupId}`)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
        actions={
          <>
            <Button
              variant="light"
              leftSection={<IconCategory size={16} />}
              onClick={openCategory}
            >
              Catégories
            </Button>
            <Button
              leftSection={<IconReceipt size={16} />}
              onClick={() =>
                navigate(`/budget/${groupId}/plans/${planId}/tracking`)
              }
            >
              Suivi des dépenses
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconLayoutDashboard size={16} />}>
            Vue d'ensemble
          </Tabs.Tab>
          <Tabs.Tab value="incomes" leftSection={<IconCash size={16} />}>
            Revenus
          </Tabs.Tab>
          <Tabs.Tab value="expenses" leftSection={<IconReceipt size={16} />}>
            Dépenses
          </Tabs.Tab>
          <Tabs.Tab value="summary" leftSection={<IconChartBar size={16} />}>
            Résumé
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          {summary ? (
            <PlanOverview plan={plan} summary={summary} />
          ) : (
            <Center py="xl">
              <Loader />
            </Center>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="incomes" pt="md">
          <IncomeStep groupId={groupId!} plan={plan} />
        </Tabs.Panel>

        <Tabs.Panel value="expenses" pt="md">
          <ExpenseStep groupId={groupId!} plan={plan} />
        </Tabs.Panel>

        <Tabs.Panel value="summary" pt="md">
          <SummaryView groupId={groupId!} planId={planId!} />
        </Tabs.Panel>
      </Tabs>

      <CategoryManagementModal
        opened={categoryOpened}
        onClose={closeCategory}
      />
    </Stack>
  );
}

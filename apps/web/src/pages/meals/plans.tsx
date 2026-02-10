import { useState } from "react";
import {
  Stack,
  SimpleGrid,
  Card,
  Group,
  Text,
  Badge,
  Alert,
  Loader,
  Center,
  Menu,
  ActionIcon,
  Button,
} from "@mantine/core";
import {
  IconCalendar,
  IconPlus,
  IconDots,
  IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useMealPlans, useDeleteMealPlan } from "../../hooks/use-meals";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";
import { CreateMealPlanModal } from "../../components/meals/create-meal-plan-modal";
import dayjs from "dayjs";
import "dayjs/locale/fr";

export function MealPlansPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading, error } = useMealPlans();
  const deletePlan = useDeleteMealPlan();
  const [createOpen, setCreateOpen] = useState(false);

  function handleDelete(id: string) {
    if (window.confirm("Supprimer ce plan de repas ?")) {
      deletePlan.mutate(id);
    }
  }

  return (
    <Stack>
      <PageHeader
        icon={IconCalendar}
        title="Plans de repas"
        subtitle="Organisez vos repas de la semaine"
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            Nouveau plan
          </Button>
        }
      />

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && (
        <Alert color="red" title="Erreur de chargement">
          {error.message}
        </Alert>
      )}

      {!isLoading && !error && (!plans || plans.length === 0) && (
        <EmptyState
          icon={IconCalendar}
          title="Aucun plan"
          description="Créez votre premier plan de repas pour organiser votre semaine."
          actionLabel="Nouveau plan"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {plans && plans.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/meals/plans/${plan.id}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Text fw={600} size="lg" lineClamp={1} style={{ flex: 1 }}>
                  {plan.name}
                </Text>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plan.id);
                      }}
                    >
                      Supprimer
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
              <Group gap="xs" mt="sm">
                <Badge size="sm" variant="light" color="blue">
                  {dayjs(plan.startDate).locale("fr").format("D MMM")} – {dayjs(plan.endDate).locale("fr").format("D MMM YYYY")}
                </Badge>
                <Badge size="sm" variant="light" color="gray">
                  {plan._count.entries} recette{plan._count.entries > 1 ? "s" : ""}
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <CreateMealPlanModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Stack>
  );
}

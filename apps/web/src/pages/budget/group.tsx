import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Card,
  Badge,
  Loader,
  Center,
  Alert,
  TextInput,
  ActionIcon,
  Table,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import {
  useBudgetGroup,
  useMonthlyPlans,
  useAddGroupMember,
  useRemoveGroupMember,
} from "../../hooks/use-budget";
import { useAuth } from "../../contexts/auth-context";
import { CreatePlanModal } from "../../components/budget/create-plan-modal";

const MONTH_NAMES = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function BudgetGroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: group, isLoading: groupLoading } = useBudgetGroup(groupId!);
  const { data: plans, isLoading: plansLoading } = useMonthlyPlans(groupId!);
  const addMember = useAddGroupMember(groupId!);
  const removeMember = useRemoveGroupMember(groupId!);
  const [planModalOpened, { open: openPlanModal, close: closePlanModal }] =
    useDisclosure(false);
  const [email, setEmail] = useState("");

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    addMember.mutate(
      { email },
      { onSuccess: () => setEmail("") },
    );
  }

  if (groupLoading || plansLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!group) {
    return <Alert color="red">Groupe non trouvé</Alert>;
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title>{group.name}</Title>
          <Text c="dimmed">Gérez les membres et les plans mensuels.</Text>
        </div>
        <Button variant="subtle" onClick={() => navigate("/budget")}>
          Retour aux groupes
        </Button>
      </Group>

      {/* Members */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={500} size="lg" mb="sm">
          Membres
        </Text>
        <Stack gap="xs">
          {group.members.map((m) => (
            <Group key={m.id} justify="space-between">
              <Text size="sm">
                {m.user.name || m.user.email}
                {m.userId === user?.id && (
                  <Badge ml="xs" size="xs" variant="light">
                    vous
                  </Badge>
                )}
              </Text>
              {m.userId !== user?.id && group.members.length > 1 && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => removeMember.mutate(m.userId)}
                >
                  x
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
        <form onSubmit={handleAddMember}>
          <Group mt="md" gap="xs">
            <TextInput
              placeholder="Ajouter un membre par email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
            />
            <Button type="submit" size="sm" loading={addMember.isPending}>
              Ajouter
            </Button>
          </Group>
        </form>
        {addMember.isError && (
          <Text c="red" size="sm" mt="xs">
            {(addMember.error as Error).message}
          </Text>
        )}
      </Card>

      {/* Monthly Plans */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Text fw={500} size="lg">
            Plans mensuels
          </Text>
          <Button size="sm" onClick={openPlanModal}>
            Nouveau plan
          </Button>
        </Group>

        {plans && plans.length === 0 && (
          <Text c="dimmed" ta="center" py="md">
            Pas encore de plan. Créez votre premier plan mensuel.
          </Text>
        )}

        {plans && plans.length > 0 && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Mois</Table.Th>
                <Table.Th>Année</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {plans.map((plan) => (
                <Table.Tr
                  key={plan.id}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/budget/${groupId}/plans/${plan.id}`)
                  }
                >
                  <Table.Td>{MONTH_NAMES[plan.month]}</Table.Td>
                  <Table.Td>{plan.year}</Table.Td>
                  <Table.Td>
                    <Button variant="subtle" size="xs">
                      Voir
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <CreatePlanModal
        groupId={groupId!}
        opened={planModalOpened}
        onClose={closePlanModal}
      />
    </Stack>
  );
}

import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router";
import { useEnvelopes } from "../../hooks/use-envelopes";
import { EnvelopeCard } from "../../components/budget/envelope-card";
import { AddEnvelopeModal } from "../../components/budget/add-envelope-modal";
import { useDisclosure } from "@mantine/hooks";

export function BudgetTrackingPage() {
  const { groupId, planId } = useParams<{
    groupId: string;
    planId: string;
  }>();
  const navigate = useNavigate();
  const { data: envelopes, isLoading, error } = useEnvelopes(groupId!, planId!);
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return <Alert color="red">Échec du chargement des enveloppes</Alert>;
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Suivi des dépenses</Title>
          <Text c="dimmed">Suivez vos dépenses par rapport à vos enveloppes budgétaires.</Text>
        </div>
        <Group>
          <Button
            variant="subtle"
            onClick={() => navigate(`/budget/${groupId}/plans/${planId}`)}
          >
            Retour au plan
          </Button>
          <Button onClick={openAdd}>Ajouter une enveloppe</Button>
        </Group>
      </Group>

      {envelopes && envelopes.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Pas encore d'enveloppe. Ajoutez-en une pour commencer à suivre vos dépenses.
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {envelopes?.map((envelope) => (
          <EnvelopeCard
            key={envelope.id}
            groupId={groupId!}
            planId={planId!}
            envelope={envelope}
          />
        ))}
      </SimpleGrid>

      <AddEnvelopeModal
        groupId={groupId!}
        planId={planId!}
        opened={addOpened}
        onClose={closeAdd}
      />
    </Stack>
  );
}

import {
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Alert,
  SimpleGrid,
  ActionIcon,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router";
import { IconReceipt, IconPlus, IconArrowLeft, IconDownload } from "@tabler/icons-react";
import { useEnvelopes } from "../../hooks/use-envelopes";
import { useMonthlyPlan } from "../../hooks/use-budget";
import { EnvelopeCard } from "../../components/budget/envelope-card";
import { AddEnvelopeModal } from "../../components/budget/add-envelope-modal";
import { ImportEnvelopesModal } from "../../components/budget/import-envelopes-modal";
import { useDisclosure } from "@mantine/hooks";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";

export function BudgetTrackingPage() {
  const { groupId, planId } = useParams<{
    groupId: string;
    planId: string;
  }>();
  const navigate = useNavigate();
  const { data: envelopes, isLoading, error } = useEnvelopes(groupId!, planId!);
  const { data: plan } = useMonthlyPlan(groupId!, planId!);
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [importOpened, { open: openImport, close: closeImport }] = useDisclosure(false);

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
      <PageHeader
        title="Suivi des dépenses"
        subtitle="Suivez vos dépenses par rapport à vos enveloppes budgétaires."
        icon={IconReceipt}
        backButton={
          <ActionIcon variant="subtle" onClick={() => navigate(`/budget/${groupId}/plans/${planId}`)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
        actions={
          <Group gap="xs">
            <Button variant="light" leftSection={<IconDownload size={16} />} onClick={openImport}>
              Importer
            </Button>
            <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
              Ajouter une enveloppe
            </Button>
          </Group>
        }
      />

      {envelopes && envelopes.length === 0 && (
        <EmptyState
          icon={IconReceipt}
          title="Aucune enveloppe"
          description="Ajoutez une enveloppe pour commencer à suivre vos dépenses."
          actionLabel="Ajouter une enveloppe"
          onAction={openAdd}
        />
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
        plan={plan}
      />

      <ImportEnvelopesModal
        groupId={groupId!}
        planId={planId!}
        opened={importOpened}
        onClose={closeImport}
      />
    </Stack>
  );
}

import {
  Text,
  Stack,
  Button,
  Card,
  Badge,
  Loader,
  Center,
  Alert,
  Group,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import { IconWallet, IconPlus, IconUsersGroup, IconArrowRight } from "@tabler/icons-react";
import { useBudgetGroups } from "../../hooks/use-budget";
import { CreateGroupModal } from "../../components/budget/create-group-modal";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";

export function BudgetPage() {
  const { data: groups, isLoading, error } = useBudgetGroups();
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <Stack>
      <PageHeader
        title="Budget"
        subtitle="Gérez vos groupes de budget"
        icon={IconWallet}
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Nouveau groupe
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

      {groups && groups.length === 0 && (
        <EmptyState
          icon={IconWallet}
          title="Aucun groupe"
          description="Créez votre premier groupe de budget pour commencer."
          actionLabel="Créer un groupe"
          onAction={open}
        />
      )}

      {groups &&
        groups.map((group) => (
          <Card
            key={group.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/budget/${group.id}`)}
          >
            <Group justify="space-between">
              <Group gap="md">
                <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                  <IconUsersGroup size={20} />
                </ThemeIcon>
                <div>
                <Text fw={500} size="lg">
                  {group.name}
                </Text>
                <Group gap="xs" mt={4}>
                  {group.members.map((m) => (
                    <Badge key={m.id} variant="light" size="sm">
                      {m.user.name || m.user.email}
                    </Badge>
                  ))}
                </Group>
                </div>
              </Group>
              <Badge variant="outline">
                {group.members.length} membre{group.members.length !== 1 ? "s" : ""}
              </Badge>
            </Group>
          </Card>
        ))}

      <CreateGroupModal opened={opened} onClose={close} />
    </Stack>
  );
}

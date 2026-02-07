import {
  Text,
  Stack,
  Group,
  Button,
  Card,
  Badge,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import { IconPaw, IconPlus } from "@tabler/icons-react";
import { useHouseholds } from "../../hooks/use-puppy";
import { CreateHouseholdModal } from "../../components/puppy/create-household-modal";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";

export function PuppyPage() {
  const { data: households, isLoading, error } = useHouseholds();
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <Stack>
      <PageHeader
        title="Animaux"
        subtitle="Gérez vos foyers et animaux"
        icon={IconPaw}
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Nouveau foyer
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

      {households && households.length === 0 && (
        <EmptyState
          icon={IconPaw}
          title="Aucun foyer"
          description="Créez votre premier foyer pour commencer à suivre vos animaux."
          actionLabel="Créer un foyer"
          onAction={open}
        />
      )}

      {households &&
        households.map((household) => (
          <Card
            key={household.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/puppy/${household.id}`)}
          >
            <Group justify="space-between">
              <div>
                <Text fw={500} size="lg">
                  {household.name}
                </Text>
                <Group gap="xs" mt={4}>
                  {household.members.map((m) => (
                    <Badge key={m.id} variant="light" size="sm">
                      {m.user.name || m.user.email}
                    </Badge>
                  ))}
                </Group>
                {household.pets.length > 0 && (
                  <Group gap="xs" mt={4}>
                    {household.pets.map((pet) => (
                      <Badge key={pet.id} variant="outline" size="sm">
                        {pet.name}
                      </Badge>
                    ))}
                  </Group>
                )}
              </div>
              <Badge variant="outline">
                {household.pets.length} {household.pets.length !== 1 ? "animaux" : "animal"}
              </Badge>
            </Group>
          </Card>
        ))}

      <CreateHouseholdModal opened={opened} onClose={close} />
    </Stack>
  );
}

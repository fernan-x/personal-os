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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import { useHouseholds } from "../../hooks/use-puppy";
import { CreateHouseholdModal } from "../../components/puppy/create-household-modal";

export function PuppyPage() {
  const { data: households, isLoading, error } = useHouseholds();
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title>Suivi des animaux</Title>
          <Text c="dimmed">
            Gérez vos animaux et leurs routines quotidiennes.
          </Text>
        </div>
        <Button onClick={open}>Nouveau foyer</Button>
      </Group>

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
        <Text c="dimmed" ta="center" py="xl">
          Pas encore de foyer. Créez-en un pour commencer à suivre vos animaux !
        </Text>
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

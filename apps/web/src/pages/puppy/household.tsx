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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import {
  useHousehold,
  useAddHouseholdMember,
  useRemoveHouseholdMember,
} from "../../hooks/use-puppy";
import { useAuth } from "../../contexts/auth-context";
import { CreatePetModal } from "../../components/puppy/create-pet-modal";

export function HouseholdPage() {
  const { householdId } = useParams<{ householdId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: household, isLoading } = useHousehold(householdId!);
  const addMember = useAddHouseholdMember(householdId!);
  const removeMember = useRemoveHouseholdMember(householdId!);
  const [petModalOpened, { open: openPetModal, close: closePetModal }] =
    useDisclosure(false);
  const [email, setEmail] = useState("");

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    addMember.mutate({ email }, { onSuccess: () => setEmail("") });
  }

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!household) {
    return <Alert color="red">Household not found</Alert>;
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title>{household.name}</Title>
          <Text c="dimmed">Manage members and pets.</Text>
        </div>
        <Group>
          <Button onClick={() => navigate(`/puppy/${householdId}/today`)}>
            Today
          </Button>
          <Button variant="subtle" onClick={() => navigate("/puppy")}>
            Back to households
          </Button>
        </Group>
      </Group>

      {/* Members */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={500} size="lg" mb="sm">
          Members
        </Text>
        <Stack gap="xs">
          {household.members.map((m) => (
            <Group key={m.id} justify="space-between">
              <Text size="sm">
                {m.user.name || m.user.email}
                {m.userId === user?.id && (
                  <Badge ml="xs" size="xs" variant="light">
                    you
                  </Badge>
                )}
              </Text>
              {m.userId !== user?.id && household.members.length > 1 && (
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
        {household.members.length < 2 && (
          <form onSubmit={handleAddMember}>
            <Group mt="md" gap="xs">
              <TextInput
                placeholder="Add member by email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                style={{ flex: 1 }}
                size="sm"
              />
              <Button type="submit" size="sm" loading={addMember.isPending}>
                Add
              </Button>
            </Group>
          </form>
        )}
        {addMember.isError && (
          <Text c="red" size="sm" mt="xs">
            {(addMember.error as Error).message}
          </Text>
        )}
      </Card>

      {/* Pets */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Text fw={500} size="lg">
            Pets
          </Text>
          <Button size="sm" onClick={openPetModal}>
            Add Pet
          </Button>
        </Group>

        {household.pets.length === 0 && (
          <Text c="dimmed" ta="center" py="md">
            No pets yet. Add your first pet!
          </Text>
        )}

        <Stack gap="xs">
          {household.pets.map((pet) => (
            <Card
              key={pet.id}
              shadow="xs"
              padding="md"
              radius="sm"
              withBorder
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/puppy/${householdId}/pets/${pet.id}`)
              }
            >
              <Group justify="space-between">
                <div>
                  <Text fw={500}>{pet.name}</Text>
                  {pet.breed && (
                    <Text size="sm" c="dimmed">
                      {pet.breed}
                    </Text>
                  )}
                </div>
                <Button variant="subtle" size="xs">
                  View
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      </Card>

      <CreatePetModal
        householdId={householdId!}
        opened={petModalOpened}
        onClose={closePetModal}
      />
    </Stack>
  );
}

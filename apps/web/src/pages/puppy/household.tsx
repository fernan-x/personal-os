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
  TextInput,
  ActionIcon,
  Avatar,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { IconPaw, IconPlus, IconArrowLeft, IconTrash, IconSun } from "@tabler/icons-react";
import {
  useHousehold,
  useAddHouseholdMember,
  useRemoveHouseholdMember,
} from "../../hooks/use-puppy";
import { useAuth } from "../../contexts/auth-context";
import { CreatePetModal } from "../../components/puppy/create-pet-modal";
import { PageHeader } from "../../components/shared/page-header";

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
    return <Alert color="red">Foyer non trouvé</Alert>;
  }

  return (
    <Stack>
      <PageHeader
        title={household.name}
        subtitle="Gérez les membres et les animaux."
        icon={IconPaw}
        backButton={
          <ActionIcon variant="subtle" onClick={() => navigate("/puppy")}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
        actions={
          <Button leftSection={<IconSun size={16} />} onClick={() => navigate(`/puppy/${householdId}/today`)}>
            Aujourd'hui
          </Button>
        }
      />

      {/* Members */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={500} size="lg" mb="sm">
          Membres
        </Text>
        <Stack gap="xs">
          {household.members.map((m) => (
            <Group key={m.id} justify="space-between">
              <Text size="sm">
                {m.user.name || m.user.email}
                {m.userId === user?.id && (
                  <Badge ml="xs" size="xs" variant="light">
                    vous
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
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
        {household.members.length < 2 && (
          <form onSubmit={handleAddMember}>
            <Group mt="md" gap="xs">
              <TextInput
                placeholder="Ajouter un membre par email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                style={{ flex: 1 }}
                size="sm"
              />
              <Button type="submit" size="sm" loading={addMember.isPending} leftSection={<IconPlus size={16} />}>
                Ajouter
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
            Animaux
          </Text>
          <Button size="sm" onClick={openPetModal} leftSection={<IconPlus size={16} />}>
            Ajouter un animal
          </Button>
        </Group>

        {household.pets.length === 0 && (
          <Text c="dimmed" ta="center" py="md">
            Pas encore d'animaux. Ajoutez votre premier animal !
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
                <Group>
                  <Avatar src={pet.photoUrl} alt={pet.name} radius="xl" size="md">
                    <IconPaw size={16} />
                  </Avatar>
                  <div>
                    <Text fw={500}>{pet.name}</Text>
                    {pet.breed && (
                      <Text size="sm" c="dimmed">
                        {pet.breed}
                      </Text>
                    )}
                  </div>
                </Group>
                <Button variant="subtle" size="xs">
                  Voir
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

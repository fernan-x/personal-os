import {
  Title,
  Text,
  Stack,
  SimpleGrid,
  Card,
  Group,
  RingProgress,
  ThemeIcon,
  Center,
  Loader,
} from "@mantine/core";
import { useNavigate } from "react-router";
import {
  IconTargetArrow,
  IconWallet,
  IconPaw,
  IconPlus,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/auth-context";
import { useHabits } from "../hooks/use-habits";
import { useBudgetGroups } from "../hooks/use-budget";
import { useHouseholds } from "../hooks/use-puppy";

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: groups, isLoading: groupsLoading } = useBudgetGroups();
  const { data: households, isLoading: householdsLoading } = useHouseholds();

  const isLoading = habitsLoading || groupsLoading || householdsLoading;

  const totalHabits = habits?.length ?? 0;
  const completedToday = habits?.filter((h) => {
    const entry = h.entries[0];
    return entry?.completed ?? false;
  }).length ?? 0;
  const habitPercent =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const totalGroups = groups?.length ?? 0;
  const totalHouseholds = households?.length ?? 0;
  const totalPets =
    households?.reduce((sum, h) => sum + (h.pets?.length ?? 0), 0) ?? 0;

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      {/* Welcome */}
      <div>
        <Title order={2}>
          Bonjour, {user?.name || "utilisateur"} !
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </div>

      {/* Stats */}
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Habitudes
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {completedToday}/{totalHabits}
              </Text>
              <Text size="sm" c="dimmed">
                terminées aujourd'hui
              </Text>
            </div>
            <RingProgress
              size={64}
              thickness={6}
              roundCaps
              sections={[{ value: habitPercent, color: "teal" }]}
              label={
                <Center>
                  <IconTargetArrow size={20} stroke={1.5} />
                </Center>
              }
            />
          </Group>
        </Card>

        <Card>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Budget
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {totalGroups}
              </Text>
              <Text size="sm" c="dimmed">
                {totalGroups <= 1 ? "groupe" : "groupes"}
              </Text>
            </div>
            <ThemeIcon variant="light" color="amber" size="xl" radius="md">
              <IconWallet size={24} stroke={1.5} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Animaux
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {totalPets}
              </Text>
              <Text size="sm" c="dimmed">
                dans {totalHouseholds} {totalHouseholds <= 1 ? "foyer" : "foyers"}
              </Text>
            </div>
            <ThemeIcon variant="light" color="blue" size="xl" radius="md">
              <IconPaw size={24} stroke={1.5} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Quick actions */}
      <div>
        <Text fw={600} size="sm" c="dimmed" tt="uppercase" mb="sm">
          Accès rapide
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {[
            {
              label: "Mes habitudes",
              icon: IconTargetArrow,
              color: "teal",
              path: "/habits",
            },
            {
              label: "Mon budget",
              icon: IconWallet,
              color: "amber",
              path: "/budget",
            },
            {
              label: "Mes animaux",
              icon: IconPaw,
              color: "blue",
              path: "/puppy",
            },
            {
              label: "Nouvelle habitude",
              icon: IconPlus,
              color: "gray",
              path: "/habits",
            },
          ].map((item) => (
            <Card
              key={item.label}
              style={{ cursor: "pointer", textAlign: "center" }}
              onClick={() => navigate(item.path)}
            >
              <Stack align="center" gap="xs" py="sm">
                <ThemeIcon
                  variant="light"
                  color={item.color}
                  size="xl"
                  radius="xl"
                >
                  <item.icon size={24} stroke={1.5} />
                </ThemeIcon>
                <Text size="sm" fw={500}>
                  {item.label}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </div>
    </Stack>
  );
}

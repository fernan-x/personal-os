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
  ActionIcon,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import { useState, useCallback } from "react";
import {
  IconTargetArrow,
  IconWallet,
  IconPaw,
  IconPlus,
  IconPencil,
  IconCheck,
} from "@tabler/icons-react";
import type { DashboardWidgetDto, WidgetType } from "@personal-os/domain";
import { useAuth } from "../contexts/auth-context";
import { useHabits } from "../hooks/use-habits";
import { useBudgetGroups } from "../hooks/use-budget";
import { useHouseholds } from "../hooks/use-puppy";
import {
  useDashboardWidgets,
  useSetDashboard,
  useRemoveDashboardWidget,
  useAddDashboardWidget,
  useUpdateDashboardWidget,
} from "../hooks/use-dashboard";
import { WidgetGrid } from "../components/dashboard/widget-grid";
import { EditModeDrawer } from "../components/dashboard/edit-mode-drawer";
import { WidgetConfigModal } from "../components/dashboard/widget-config-modal";

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: groups, isLoading: groupsLoading } = useBudgetGroups();
  const { data: households, isLoading: householdsLoading } = useHouseholds();
  const { data: widgets, isLoading: widgetsLoading } = useDashboardWidgets();

  const setDashboard = useSetDashboard();
  const removeDashboardWidget = useRemoveDashboardWidget();
  const addDashboardWidget = useAddDashboardWidget();
  const updateDashboardWidget = useUpdateDashboardWidget();

  const [editMode, setEditMode] = useState(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [configModal, setConfigModal] = useState<{
    type: WidgetType | null;
    widget?: DashboardWidgetDto;
  }>({ type: null });

  const isLoading = habitsLoading || groupsLoading || householdsLoading || widgetsLoading;

  const totalHabits = habits?.length ?? 0;
  const completedToday =
    habits?.filter((h) => {
      const entry = h.entries[0];
      return entry?.completed ?? false;
    }).length ?? 0;
  const habitPercent =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const totalGroups = groups?.length ?? 0;
  const totalHouseholds = households?.length ?? 0;
  const totalPets =
    households?.reduce((sum, h) => sum + (h.pets?.length ?? 0), 0) ?? 0;

  const sortedWidgets = [...(widgets ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  const handleReorder = useCallback(
    (reordered: DashboardWidgetDto[]) => {
      setDashboard.mutate({
        widgets: reordered.map((w) => ({
          id: w.id,
          type: w.type,
          position: w.position,
          config: w.config,
        })),
      });
    },
    [setDashboard],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeDashboardWidget.mutate(id);
    },
    [removeDashboardWidget],
  );

  const handleAddWidgetType = useCallback(
    (type: WidgetType) => {
      closeDrawer();
      // Types that need config before adding
      if (type === "budget_summary" || type === "pet_today_activities" || type === "pet_activities" || type === "pet_weight_evolution") {
        setConfigModal({ type });
      } else {
        // Add immediately with defaults
        addDashboardWidget.mutate({
          type,
          config: type === "habit_evolution" ? { period: "weekly" } : {},
        });
      }

    },
    [closeDrawer, addDashboardWidget],
  );

  const handleConfigSave = useCallback(
    (config: Record<string, unknown>) => {
      if (configModal.widget) {
        // Editing existing widget
        updateDashboardWidget.mutate({ id: configModal.widget.id, config });
      } else if (configModal.type) {
        // Adding new widget with config
        addDashboardWidget.mutate({
          type: configModal.type,
          config,
        });
      }
      setConfigModal({ type: null });
    },
    [configModal, addDashboardWidget, updateDashboardWidget],
  );

  const handleConfigure = useCallback((widget: DashboardWidgetDto) => {
    setConfigModal({
      type: widget.type as WidgetType,
      widget,
    });
  }, []);

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
      <Group justify="space-between" align="flex-start">
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
        <ActionIcon
          variant={editMode ? "filled" : "subtle"}
          color={editMode ? "teal" : "gray"}
          size="lg"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? <IconCheck size={18} /> : <IconPencil size={18} />}
        </ActionIcon>
      </Group>

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
                dans {totalHouseholds}{" "}
                {totalHouseholds <= 1 ? "foyer" : "foyers"}
              </Text>
            </div>
            <ThemeIcon variant="light" color="blue" size="xl" radius="md">
              <IconPaw size={24} stroke={1.5} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Dashboard widgets */}
      {sortedWidgets.length > 0 ? (
        <div>
          <Group justify="space-between" mb="sm">
            <Text fw={600} size="sm" c="dimmed" tt="uppercase">
              Tableau de bord
            </Text>
            {editMode && (
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={openDrawer}
              >
                Ajouter
              </Button>
            )}
          </Group>
          <WidgetGrid
            widgets={sortedWidgets}
            editMode={editMode}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onConfigure={handleConfigure}
          />
        </div>
      ) : editMode ? (
        <div>
          <Group justify="space-between" mb="sm">
            <Text fw={600} size="sm" c="dimmed" tt="uppercase">
              Tableau de bord
            </Text>
          </Group>
          <Card withBorder padding="xl" style={{ textAlign: "center" }}>
            <Text c="dimmed" mb="sm">
              Ajoutez des widgets pour personnaliser votre tableau de bord
            </Text>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={openDrawer}
            >
              Ajouter un widget
            </Button>
          </Card>
        </div>
      ) : null}

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

      {/* Edit mode drawer */}
      <EditModeDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        onAdd={handleAddWidgetType}
      />

      {/* Widget config modal */}
      <WidgetConfigModal
        opened={configModal.type !== null}
        onClose={() => setConfigModal({ type: null })}
        widgetType={configModal.type}
        initialConfig={configModal.widget?.config}
        onSave={handleConfigSave}
      />
    </Stack>
  );
}

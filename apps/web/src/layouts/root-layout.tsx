import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/auth-context";
import {
  IconHome,
  IconTargetArrow,
  IconWallet,
  IconPaw,
  IconLogout,
  IconChevronDown,
  IconLayoutDashboard,
  IconToolsKitchen2,
  IconSettings,
  IconReceipt,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ size: number; stroke: number }>;
  moduleId?: string;
}

const navItems: NavItem[] = [
  { label: "Accueil", path: "/", icon: IconHome },
  { label: "Habitudes", path: "/habits", icon: IconTargetArrow, moduleId: "habits" },
  { label: "Budget", path: "/budget", icon: IconWallet, moduleId: "budget" },
  { label: "Animaux", path: "/puppy", icon: IconPaw, moduleId: "pets" },
  { label: "Repas", path: "/meals", icon: IconToolsKitchen2, moduleId: "meals" },
];

function extractBudgetPlanContext(pathname: string): { groupId: string; planId: string } | null {
  const match = pathname.match(/^\/budget\/([^/]+)\/plans\/([^/]+)/);
  if (!match) return null;
  return { groupId: match[1], planId: match[2] };
}

export function RootLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const budgetPlanCtx = extractBudgetPlanContext(location.pathname);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function getInitial(): string {
    return (
      user?.name?.[0]?.toUpperCase() ||
      user?.email?.[0]?.toUpperCase() ||
      "U"
    );
  }

  function isActive(path: string): boolean {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group gap="xs">
              <IconLayoutDashboard
                size={28}
                stroke={1.5}
                color="var(--mantine-color-teal-5)"
              />
              <Title order={3} fw={700}>
                Personal OS
              </Title>
            </Group>
          </Group>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar color="teal" radius="xl" size="sm">
                    {getInitial()}
                  </Avatar>
                  <Text size="sm" fw={500} visibleFrom="sm">
                    {user?.name || user?.email}
                  </Text>
                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => navigate("/settings")}
              >
                Paramètres
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Deconnexion
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {navItems
            .filter(
              (item) =>
                !item.moduleId ||
                user?.enabledModules.includes(item.moduleId),
            )
            .map((item) => {
              if (item.path === "/budget" && budgetPlanCtx) {
                const trackingPath = `/budget/${budgetPlanCtx.groupId}/plans/${budgetPlanCtx.planId}/tracking`;
                const planPath = `/budget/${budgetPlanCtx.groupId}/plans/${budgetPlanCtx.planId}`;
                return (
                  <NavLink
                    key={item.path}
                    label={item.label}
                    leftSection={<item.icon size={20} stroke={1.5} />}
                    active={isActive(item.path)}
                    defaultOpened
                    onClick={() => {
                      navigate(item.path);
                      toggle();
                    }}
                  >
                    <NavLink
                      label="Planification"
                      leftSection={<IconWallet size={16} stroke={1.5} />}
                      active={location.pathname === planPath}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(planPath);
                        toggle();
                      }}
                    />
                    <NavLink
                      label="Suivi des dépenses"
                      leftSection={<IconReceipt size={16} stroke={1.5} />}
                      active={location.pathname === trackingPath}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(trackingPath);
                        toggle();
                      }}
                    />
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<item.icon size={20} stroke={1.5} />}
                  active={isActive(item.path)}
                  onClick={() => {
                    navigate(item.path);
                    toggle();
                  }}
                />
              );
            })}
        </AppShell.Section>
        <AppShell.Section>
          <Divider mb="sm" color="cream.2" />
          <Group gap="sm" p="xs">
            <Avatar color="teal" radius="xl" size="sm">
              {getInitial()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} lineClamp={1}>
                {user?.name || "Utilisateur"}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {user?.email}
              </Text>
            </div>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

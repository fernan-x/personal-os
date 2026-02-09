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
} from "@tabler/icons-react";
import type { ComponentType } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ size: number; stroke: number }>;
}

const navItems: NavItem[] = [
  { label: "Accueil", path: "/", icon: IconHome },
  { label: "Habitudes", path: "/habits", icon: IconTargetArrow },
  { label: "Budget", path: "/budget", icon: IconWallet },
  { label: "Animaux", path: "/puppy", icon: IconPaw },
  { label: "Repas", path: "/meals", icon: IconToolsKitchen2 },
];

export function RootLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
          {navItems.map((item) => (
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
          ))}
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

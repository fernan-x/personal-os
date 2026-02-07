import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Text,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/auth-context";

const navItems = [
  { label: "Accueil", path: "/" },
  { label: "Habitudes", path: "/habits" },
  { label: "Budget", path: "/budget" },
  { label: "Animaux", path: "/puppy" },
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

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
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
            <Title order={3}>Personal OS</Title>
          </Group>
          <Group>
            <Text size="sm" c="dimmed">
              {user?.email}
            </Text>
            <Button variant="subtle" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            active={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              toggle();
            }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

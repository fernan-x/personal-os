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
import { useBudgetGroups } from "../../hooks/use-budget";
import { CreateGroupModal } from "../../components/budget/create-group-modal";

export function BudgetPage() {
  const { data: groups, isLoading, error } = useBudgetGroups();
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Title>Budget</Title>
          <Text c="dimmed">Manage your budget groups and monthly plans.</Text>
        </div>
        <Button onClick={open}>New Group</Button>
      </Group>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && (
        <Alert color="red" title="Error loading groups">
          {error.message}
        </Alert>
      )}

      {groups && groups.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No budget groups yet. Create one to get started!
        </Text>
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
              <Badge variant="outline">
                {group.members.length} member{group.members.length !== 1 ? "s" : ""}
              </Badge>
            </Group>
          </Card>
        ))}

      <CreateGroupModal opened={opened} onClose={close} />
    </Stack>
  );
}

import { useState } from "react";
import {
  Stack,
  Card,
  TextInput,
  Button,
  Group,
  Switch,
  Text,
  Badge,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { MODULES, MODULE_DEFINITIONS } from "@personal-os/domain";
import { useAuth } from "../contexts/auth-context";
import { useUpdateProfile, useUpdateModules } from "../hooks/use-user";
import { PageHeader } from "../components/shared/page-header";

export function SettingsPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateModules = useUpdateModules();

  const [name, setName] = useState(user?.name ?? "");

  function handleSaveProfile() {
    updateProfile.mutate({ name: name.trim() || undefined });
  }

  function handleToggleModule(moduleId: string, enabled: boolean) {
    if (!user) return;
    const next = enabled
      ? [...user.enabledModules, moduleId]
      : user.enabledModules.filter((id) => id !== moduleId);
    updateModules.mutate({ enabledModules: next });
  }

  return (
    <Stack gap="xl">
      <PageHeader
        title="Paramètres"
        subtitle="Gérez votre profil et vos modules"
        icon={IconSettings}
      />

      {/* Profile section */}
      <Card>
        <Text fw={600} size="lg" mb="md">
          Profil
        </Text>
        <Stack gap="md">
          <TextInput
            label="Email"
            value={user?.email ?? ""}
            disabled
          />
          <TextInput
            label="Nom"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Group>
            <Button
              onClick={handleSaveProfile}
              loading={updateProfile.isPending}
            >
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Modules section */}
      <Card>
        <Text fw={600} size="lg" mb="md">
          Modules
        </Text>
        <Stack gap="sm">
          {MODULES.map((moduleId) => {
            const def = MODULE_DEFINITIONS[moduleId];
            const enabled = user?.enabledModules.includes(moduleId) ?? false;
            return (
              <Group key={moduleId} justify="space-between">
                <Group gap="sm">
                  <Badge color={def.color} variant="light">
                    {def.label}
                  </Badge>
                </Group>
                <Switch
                  checked={enabled}
                  onChange={(e) =>
                    handleToggleModule(moduleId, e.currentTarget.checked)
                  }
                  disabled={updateModules.isPending}
                />
              </Group>
            );
          })}
        </Stack>
      </Card>
    </Stack>
  );
}

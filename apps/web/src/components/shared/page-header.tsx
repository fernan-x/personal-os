import { Group, Title, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode, ComponentType } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ size: number; stroke: number }>;
  actions?: ReactNode;
  backButton?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  backButton,
}: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <Group gap="md" align="center">
        {backButton}
        {Icon && (
          <ThemeIcon variant="light" color="teal" size="xl" radius="md">
            <Icon size={24} stroke={1.5} />
          </ThemeIcon>
        )}
        <div>
          <Title order={2}>{title}</Title>
          {subtitle && (
            <Text c="dimmed" size="sm" mt={2}>
              {subtitle}
            </Text>
          )}
        </div>
      </Group>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}

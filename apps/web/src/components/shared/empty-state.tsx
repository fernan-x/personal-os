import { Stack, Text, ThemeIcon, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ComponentType } from "react";

interface EmptyStateProps {
  icon: ComponentType<{ size: number; stroke: number }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon variant="light" color="gray" size={64} radius="xl">
        <Icon size={32} stroke={1.5} />
      </ThemeIcon>
      <Text fw={500} size="lg">
        {title}
      </Text>
      <Text c="dimmed" ta="center" maw={400}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button onClick={onAction} leftSection={<IconPlus size={16} />}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

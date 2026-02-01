import { Title, Text, Stack } from "@mantine/core";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Stack gap="xs">
      <Title order={2}>{title}</Title>
      {description && <Text c="dimmed">{description}</Text>}
    </Stack>
  );
}

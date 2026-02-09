import { Group, Badge } from "@mantine/core";
import {
  IconFlame,
  IconMeat,
  IconBread,
  IconDroplet,
} from "@tabler/icons-react";

interface MacrosDisplayProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  size?: "sm" | "md";
}

export function MacrosDisplay({
  calories,
  protein,
  carbs,
  fat,
  size = "sm",
}: MacrosDisplayProps) {
  const hasMacros =
    calories != null || protein != null || carbs != null || fat != null;

  if (!hasMacros) return null;

  const iconSize = size === "sm" ? 12 : 14;

  return (
    <Group gap={4} wrap="wrap">
      {calories != null && (
        <Badge
          size={size === "sm" ? "xs" : "sm"}
          variant="light"
          color="orange"
          leftSection={<IconFlame size={iconSize} />}
        >
          {calories} kcal
        </Badge>
      )}
      {protein != null && (
        <Badge
          size={size === "sm" ? "xs" : "sm"}
          variant="light"
          color="red"
          leftSection={<IconMeat size={iconSize} />}
        >
          {protein}g prot
        </Badge>
      )}
      {carbs != null && (
        <Badge
          size={size === "sm" ? "xs" : "sm"}
          variant="light"
          color="yellow"
          leftSection={<IconBread size={iconSize} />}
        >
          {carbs}g gluc
        </Badge>
      )}
      {fat != null && (
        <Badge
          size={size === "sm" ? "xs" : "sm"}
          variant="light"
          color="grape"
          leftSection={<IconDroplet size={iconSize} />}
        >
          {fat}g lip
        </Badge>
      )}
    </Group>
  );
}

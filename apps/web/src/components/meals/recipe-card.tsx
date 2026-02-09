import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Image,
  ActionIcon,
} from "@mantine/core";
import {
  IconHeart,
  IconHeartFilled,
  IconClock,
  IconChefHat,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { DIFFICULTY_LABELS, computeTotalTime } from "@personal-os/domain";
import { MacrosDisplay } from "./macros-display";
import { useToggleFavorite } from "../../hooks/use-meals";
import type { RecipeListItem } from "../../hooks/use-meals";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "green",
  medium: "yellow",
  hard: "red",
};

interface RecipeCardProps {
  recipe: RecipeListItem;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();
  const toggleFavorite = useToggleFavorite();
  const totalTime = computeTotalTime(recipe.prepTime, recipe.cookTime);

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    toggleFavorite.mutate(recipe.id);
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/meals/${recipe.id}`)}
    >
      <Card.Section>
        <Image
          src={recipe.photoUrl}
          height={180}
          alt={recipe.title}
          fallbackSrc="https://placehold.co/400x180?text=Recette"
        />
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fw={600} size="lg" lineClamp={2} style={{ flex: 1 }}>
            {recipe.title}
          </Text>
          <ActionIcon
            variant="subtle"
            color={recipe.isFavorited ? "red" : "gray"}
            onClick={handleFavorite}
            loading={toggleFavorite.isPending}
          >
            {recipe.isFavorited ? (
              <IconHeartFilled size={18} />
            ) : (
              <IconHeart size={18} />
            )}
          </ActionIcon>
        </Group>

        <Group gap="xs">
          <Badge
            size="sm"
            variant="light"
            color={DIFFICULTY_COLORS[recipe.difficulty] ?? "gray"}
            leftSection={<IconChefHat size={12} />}
          >
            {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
          </Badge>
          {totalTime != null && (
            <Badge
              size="sm"
              variant="light"
              color="blue"
              leftSection={<IconClock size={12} />}
            >
              {totalTime} min
            </Badge>
          )}
          <Badge size="sm" variant="light" color="gray">
            {recipe.servings} pers.
          </Badge>
        </Group>

        <MacrosDisplay
          calories={recipe.calories}
          protein={recipe.protein}
          carbs={recipe.carbs}
          fat={recipe.fat}
        />

        {recipe.tags.length > 0 && (
          <Group gap={4}>
            {recipe.tags.map((tl) => (
              <Badge key={tl.tagId} size="xs" variant="dot" color="teal">
                {tl.tag.name}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

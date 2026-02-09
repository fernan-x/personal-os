import { useState } from "react";
import {
  Stack,
  Group,
  Title,
  Text,
  Image,
  Badge,
  Card,
  NumberInput,
  Button,
  Anchor,
  ActionIcon,
  Alert,
  Loader,
  Center,
  Divider,
  Table,
  List,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconPencil,
  IconTrash,
  IconClock,
  IconChefHat,
  IconExternalLink,
} from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router";
import {
  DIFFICULTY_LABELS,
  INGREDIENT_UNIT_LABELS,
  computeTotalTime,
  scaleMacros,
} from "@personal-os/domain";
import { MacrosDisplay } from "../../components/meals/macros-display";
import {
  useRecipe,
  useDeleteRecipe,
  useToggleFavorite,
} from "../../hooks/use-meals";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "green",
  medium: "yellow",
  hard: "red",
};

export function RecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { data: recipe, isLoading, error } = useRecipe(recipeId!);
  const deleteRecipe = useDeleteRecipe();
  const toggleFavorite = useToggleFavorite();
  const [servings, setServings] = useState<number | undefined>(undefined);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error || !recipe) {
    return (
      <Alert color="red" title="Erreur">
        {error?.message ?? "Recette introuvable"}
      </Alert>
    );
  }

  const displayServings = servings ?? recipe.servings;
  const scale = displayServings / recipe.servings;
  const totalTime = computeTotalTime(recipe.prepTime, recipe.cookTime);
  const scaled = scaleMacros(
    { calories: recipe.calories, protein: recipe.protein, carbs: recipe.carbs, fat: recipe.fat },
    recipe.servings,
    displayServings,
  );

  function handleDelete() {
    if (confirm("Supprimer cette recette ?")) {
      deleteRecipe.mutate(recipe!.id, {
        onSuccess: () => navigate("/meals"),
      });
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/meals")}
        >
          Retour
        </Button>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color={recipe.isFavorited ? "red" : "gray"}
            size="lg"
            onClick={() => toggleFavorite.mutate(recipe.id)}
          >
            {recipe.isFavorited ? (
              <IconHeartFilled size={20} />
            ) : (
              <IconHeart size={20} />
            )}
          </ActionIcon>
          {recipe.user.id === recipe.userId && (
            <>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPencil size={16} />}
                onClick={() => navigate(`/meals/${recipe.id}/edit`)}
              >
                Modifier
              </Button>
              <Button
                variant="light"
                color="red"
                size="sm"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                loading={deleteRecipe.isPending}
              >
                Supprimer
              </Button>
            </>
          )}
        </Group>
      </Group>

      <Image
        src={recipe.photoUrl}
        height={300}
        radius="md"
        alt={recipe.title}
        fallbackSrc="https://placehold.co/800x300?text=Recette"
      />

      <Stack gap="sm">
        <Title order={2}>{recipe.title}</Title>

        {recipe.description && (
          <Text c="dimmed">{recipe.description}</Text>
        )}

        <Group gap="xs">
          <Badge
            size="md"
            variant="light"
            color={DIFFICULTY_COLORS[recipe.difficulty] ?? "gray"}
            leftSection={<IconChefHat size={14} />}
          >
            {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
          </Badge>
          {totalTime != null && (
            <Badge
              size="md"
              variant="light"
              color="blue"
              leftSection={<IconClock size={14} />}
            >
              {totalTime} min
              {recipe.prepTime != null && recipe.cookTime != null &&
                ` (${recipe.prepTime} prép + ${recipe.cookTime} cuisson)`}
            </Badge>
          )}
          {recipe.tags.map((tl) => (
            <Badge key={tl.tagId} size="md" variant="dot" color="teal">
              {tl.tag.name}
            </Badge>
          ))}
        </Group>

        {recipe.sourceUrl && (
          <Anchor
            href={recipe.sourceUrl}
            target="_blank"
            size="sm"
            c="dimmed"
          >
            <Group gap={4}>
              <IconExternalLink size={14} />
              Source
            </Group>
          </Anchor>
        )}
      </Stack>

      <Divider />

      <Group gap="md" align="flex-end">
        <NumberInput
          label="Portions"
          value={displayServings}
          onChange={(v) => setServings(typeof v === "number" ? v : undefined)}
          min={1}
          max={50}
          w={120}
        />
        <MacrosDisplay
          calories={scaled.calories}
          protein={scaled.protein}
          carbs={scaled.carbs}
          fat={scaled.fat}
          size="md"
        />
      </Group>

      <Divider />

      <Card withBorder padding="md" radius="md">
        <Title order={4} mb="sm">
          Ingrédients
        </Title>
        <Table>
          <Table.Tbody>
            {recipe.ingredients.map((ing) => (
              <Table.Tr key={ing.id}>
                <Table.Td fw={500}>{ing.name}</Table.Td>
                <Table.Td ta="right">
                  {Math.round(ing.quantity * scale * 100) / 100}{" "}
                  {INGREDIENT_UNIT_LABELS[ing.unit] ?? ing.unit}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Card withBorder padding="md" radius="md">
        <Title order={4} mb="sm">
          Instructions
        </Title>
        <List type="ordered" spacing="sm">
          {recipe.instructions.map((ins) => (
            <List.Item key={ins.id}>{ins.content}</List.Item>
          ))}
        </List>
      </Card>
    </Stack>
  );
}

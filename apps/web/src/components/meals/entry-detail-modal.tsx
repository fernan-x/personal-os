import {
  Modal,
  Image,
  Text,
  Badge,
  Group,
  Table,
  Button,
  Stack,
} from "@mantine/core";
import { IconClock, IconChefHat } from "@tabler/icons-react";
import {
  scaleMacros,
  DIFFICULTY_LABELS,
  INGREDIENT_UNIT_LABELS,
} from "@personal-os/domain";
import { MacrosDisplay } from "./macros-display";
import { Link } from "react-router";
import type { MealPlanEntryDetail } from "../../hooks/use-meals";

interface EntryDetailModalProps {
  entry: MealPlanEntryDetail | null;
  opened: boolean;
  onClose: () => void;
}

export function EntryDetailModal({ entry, opened, onClose }: EntryDetailModalProps) {
  if (!entry) return null;

  const { recipe } = entry;
  const scaled = scaleMacros(recipe, recipe.servings, entry.servings);
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
  const scale = entry.servings / recipe.servings;

  return (
    <Modal opened={opened} onClose={onClose} title={recipe.title} size="lg">
      <Stack gap="md">
        {recipe.photoUrl && (
          <Image
            src={recipe.photoUrl}
            height={200}
            radius="sm"
            alt={recipe.title}
            fallbackSrc="https://placehold.co/600x200?text=Recette"
          />
        )}

        {recipe.description && (
          <Text size="sm" c="dimmed">
            {recipe.description}
          </Text>
        )}

        <Group gap="xs">
          <Badge
            variant="light"
            color="blue"
            leftSection={<IconChefHat size={14} />}
          >
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </Badge>
          {totalTime > 0 && (
            <Badge
              variant="light"
              color="cyan"
              leftSection={<IconClock size={14} />}
            >
              {totalTime} min
            </Badge>
          )}
          <Badge variant="light" color="gray">
            {entry.servings} pers.
          </Badge>
          {recipe.tags?.map(({ tag }) => (
            <Badge key={tag.id} variant="light" color="teal">
              {tag.name}
            </Badge>
          ))}
        </Group>

        <MacrosDisplay {...scaled} size="md" />

        {recipe.ingredients.length > 0 && (
          <>
            <Text fw={600} size="sm">
              Ingrédients
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ingrédient</Table.Th>
                  <Table.Th style={{ width: 100 }}>Quantité</Table.Th>
                  <Table.Th style={{ width: 80 }}>Unité</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recipe.ingredients.map((ing) => (
                  <Table.Tr key={ing.id}>
                    <Table.Td>{ing.name}</Table.Td>
                    <Table.Td>
                      {Math.round(ing.quantity * scale * 100) / 100}
                    </Table.Td>
                    <Table.Td>
                      {INGREDIENT_UNIT_LABELS[ing.unit] ?? ing.unit}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        )}

        <Button
          component={Link}
          to={`/meals/${recipe.id}`}
          variant="light"
          fullWidth
        >
          Voir la recette
        </Button>
      </Stack>
    </Modal>
  );
}

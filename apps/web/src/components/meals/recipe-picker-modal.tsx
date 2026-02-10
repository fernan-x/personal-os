import { useState } from "react";
import {
  Modal,
  TextInput,
  SimpleGrid,
  Card,
  Text,
  Image,
  Badge,
  Group,
  Loader,
  Center,
  Stack,
  NumberInput,
  Button,
  Checkbox,
  Table,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconArrowLeft } from "@tabler/icons-react";
import { MEAL_SLOT_LABELS, scaleMacros } from "@personal-os/domain";
import type { MealSlot } from "@personal-os/domain";
import { MacrosDisplay } from "./macros-display";
import { useRecipes, useCreateMealPlanEntry } from "../../hooks/use-meals";
import type { RecipeListItem } from "../../hooks/use-meals";
import dayjs from "dayjs";
import "dayjs/locale/fr";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

interface RecipePickerModalProps {
  opened: boolean;
  onClose: () => void;
  planId: string;
  initialDate: string;
  initialSlot: MealSlot;
  planStartDate: string;
  planEndDate: string;
}

function getDatesArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function RecipePickerModal({
  opened,
  onClose,
  planId,
  initialDate,
  initialSlot,
  planStartDate,
  planEndDate,
}: RecipePickerModalProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const createEntry = useCreateMealPlanEntry();

  // Step state
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItem | null>(null);
  const [servings, setServings] = useState<number>(4);
  const [checkedSlots, setCheckedSlots] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useRecipes(
    opened ? { search: debouncedSearch || undefined } : undefined,
  );

  const recipes = data?.data ?? [];
  const dates = getDatesArray(planStartDate, planEndDate);

  function handleSelectRecipe(recipe: RecipeListItem) {
    setSelectedRecipe(recipe);
    setServings(recipe.servings);
    setCheckedSlots(new Set([`${initialDate}::${initialSlot}`]));
  }

  function handleBack() {
    setSelectedRecipe(null);
    setCheckedSlots(new Set());
  }

  function toggleSlot(dateStr: string, slot: MealSlot) {
    const key = `${dateStr}::${slot}`;
    setCheckedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function handleConfirm() {
    if (!selectedRecipe || checkedSlots.size === 0) return;
    setIsSubmitting(true);

    for (const key of checkedSlots) {
      const [date, slot] = key.split("::") as [string, MealSlot];
      await createEntry.mutateAsync({
        planId,
        recipeId: selectedRecipe.id,
        date,
        slot,
        servings,
      });
    }

    setIsSubmitting(false);
    handleClose();
  }

  function handleClose() {
    setSearch("");
    setSelectedRecipe(null);
    setCheckedSlots(new Set());
    setIsSubmitting(false);
    onClose();
  }

  const dateLabel = dayjs(initialDate).locale("fr").format("dddd D MMMM");
  const title = selectedRecipe
    ? selectedRecipe.title
    : `${MEAL_SLOT_LABELS[initialSlot]}, ${dateLabel}`;

  return (
    <Modal opened={opened} onClose={handleClose} title={title} size="lg">
      {!selectedRecipe ? (
        // Step A — Search & select recipe
        <Stack gap="md">
          <TextInput
            placeholder="Rechercher une recette..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          {isLoading && (
            <Center py="xl">
              <Loader />
            </Center>
          )}

          {!isLoading && recipes.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              Aucune recette trouvée
            </Text>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                shadow="sm"
                padding="sm"
                radius="sm"
                withBorder
                style={{ cursor: "pointer" }}
                onClick={() => handleSelectRecipe(recipe)}
              >
                <Card.Section>
                  <Image
                    src={recipe.photoUrl}
                    height={100}
                    alt={recipe.title}
                    fallbackSrc="https://placehold.co/200x100?text=Recette"
                  />
                </Card.Section>
                <Text size="sm" fw={500} lineClamp={1} mt="xs">
                  {recipe.title}
                </Text>
                <Group gap={4} mt={4}>
                  <Badge size="xs" variant="light" color="gray">
                    {recipe.servings} pers.
                  </Badge>
                  {recipe.prepTime != null && (
                    <Badge size="xs" variant="light" color="blue">
                      {recipe.prepTime + (recipe.cookTime ?? 0)} min
                    </Badge>
                  )}
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      ) : (
        // Step B — Configure servings & multi-slot assignment
        <Stack gap="md">
          <Group gap="md" align="flex-start">
            {selectedRecipe.photoUrl && (
              <Image
                src={selectedRecipe.photoUrl}
                height={80}
                width={120}
                radius="sm"
                alt={selectedRecipe.title}
                fallbackSrc="https://placehold.co/120x80?text=..."
              />
            )}
            <Stack gap={4} style={{ flex: 1 }}>
              <Text fw={600}>{selectedRecipe.title}</Text>
              <MacrosDisplay
                {...scaleMacros(selectedRecipe, selectedRecipe.servings, servings)}
                size="sm"
              />
            </Stack>
          </Group>

          <NumberInput
            label="Nombre de portions"
            value={servings}
            onChange={(val) => setServings(typeof val === "number" ? val : servings)}
            min={1}
            max={50}
          />

          <Text fw={600} size="sm">
            Créneaux
          </Text>

          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Jour</Table.Th>
                {SLOTS.map((slot) => (
                  <Table.Th key={slot} style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    {MEAL_SLOT_LABELS[slot]}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {dates.map((dateStr) => (
                <Table.Tr key={dateStr}>
                  <Table.Td>
                    <Text size="sm">
                      {dayjs(dateStr).locale("fr").format("ddd D MMM")}
                    </Text>
                  </Table.Td>
                  {SLOTS.map((slot) => (
                    <Table.Td key={slot} style={{ textAlign: "center" }}>
                      <Checkbox
                        checked={checkedSlots.has(`${dateStr}::${slot}`)}
                        onChange={() => toggleSlot(dateStr, slot)}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Retour
            </Button>
            <Button
              onClick={handleConfirm}
              loading={isSubmitting}
              disabled={checkedSlots.size === 0}
            >
              Ajouter ({checkedSlots.size})
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

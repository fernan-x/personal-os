import { useState } from "react";
import {
  Stack,
  Button,
  SimpleGrid,
  Alert,
  Loader,
  Center,
  TextInput,
  Group,
  SegmentedControl,
  Select,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconToolsKitchen2,
  IconPlus,
  IconSearch,
  IconCalendar,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import {
  RECIPE_DIFFICULTIES,
  DIFFICULTY_LABELS,
} from "@personal-os/domain";
import type { RecipeFilters } from "@personal-os/domain";
import { useRecipes, useMyRecipes } from "../../hooks/use-meals";
import { RecipeCard } from "../../components/meals/recipe-card";
import { PageHeader } from "../../components/shared/page-header";
import { EmptyState } from "../../components/shared/empty-state";

type Tab = "all" | "mine" | "favorites";

export function RecipesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const filters: RecipeFilters = {
    search: debouncedSearch || undefined,
    difficulty: (difficulty as RecipeFilters["difficulty"]) || undefined,
    favorite: tab === "favorites" ? true : undefined,
  };

  const allQuery = useRecipes(tab === "all" || tab === "favorites" ? filters : undefined);
  const mineQuery = useMyRecipes();

  const isLoading =
    tab === "mine" ? mineQuery.isLoading : allQuery.isLoading;
  const error = tab === "mine" ? mineQuery.error : allQuery.error;

  const recipes =
    tab === "mine"
      ? mineQuery.data ?? []
      : allQuery.data?.data ?? [];

  // Apply client-side filters for "mine" tab
  const filteredRecipes =
    tab === "mine"
      ? recipes.filter((r) => {
          if (debouncedSearch && !r.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
          if (difficulty && r.difficulty !== difficulty) return false;
          return true;
        })
      : recipes;

  const difficultyOptions = [
    { value: "", label: "Toutes" },
    ...RECIPE_DIFFICULTIES.map((d) => ({
      value: d,
      label: DIFFICULTY_LABELS[d] ?? d,
    })),
  ];

  return (
    <Stack>
      <PageHeader
        icon={IconToolsKitchen2}
        title="Repas"
        subtitle="Votre livre de recettes personnel"
        actions={
          <>
            <Button
              variant="light"
              leftSection={<IconCalendar size={16} />}
              onClick={() => navigate("/meals/plans")}
            >
              Plans de repas
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate("/meals/new")}
            >
              Nouvelle recette
            </Button>
          </>
        }
      />

      <Group gap="md" align="flex-end">
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          data={[
            { label: "Toutes", value: "all" },
            { label: "Mes recettes", value: "mine" },
            { label: "Favoris", value: "favorites" },
          ]}
        />
        <TextInput
          placeholder="Rechercher..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Difficulté"
          data={difficultyOptions}
          value={difficulty}
          onChange={setDifficulty}
          clearable
          w={150}
        />
      </Group>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && (
        <Alert color="red" title="Erreur de chargement">
          {error.message}
        </Alert>
      )}

      {!isLoading && !error && filteredRecipes.length === 0 && (
        <EmptyState
          icon={IconToolsKitchen2}
          title="Aucune recette"
          description="Pas encore de recettes — ajoutez votre première !"
          actionLabel="Nouvelle recette"
          onAction={() => navigate("/meals/new")}
        />
      )}

      {filteredRecipes.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

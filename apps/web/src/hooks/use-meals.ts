import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import type {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  RecipeTag,
  RecipeTagLink,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeFilters,
} from "@personal-os/domain";

// ── Types ────────────────────────────────────────────────────

export type RecipeListItem = Recipe & {
  tags: (RecipeTagLink & { tag: RecipeTag })[];
  isFavorited: boolean;
  _count?: { favorites: number };
};

export type RecipeDetail = Recipe & {
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tags: (RecipeTagLink & { tag: RecipeTag })[];
  isFavorited: boolean;
  user: { id: string; name: string | null };
};

interface PaginatedRecipes {
  data: RecipeListItem[];
  total: number;
  page: number;
  limit: number;
}

// ── Query keys ───────────────────────────────────────────────

export const mealKeys = {
  recipes: (filters?: RecipeFilters) => ["meals", "recipes", filters] as const,
  myRecipes: ["meals", "recipes", "mine"] as const,
  recipe: (id: string) => ["meals", "recipes", id] as const,
  tags: ["meals", "tags"] as const,
};

// ── Recipe queries ───────────────────────────────────────────

export function useRecipes(filters?: RecipeFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.difficulty) params.set("difficulty", filters.difficulty);
  if (filters?.tagIds?.length) params.set("tagIds", filters.tagIds.join(","));
  if (filters?.maxPrepTime != null)
    params.set("maxPrepTime", String(filters.maxPrepTime));
  if (filters?.maxCalories != null)
    params.set("maxCalories", String(filters.maxCalories));
  if (filters?.favorite) params.set("favorite", "true");
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  const path = qs ? `meals/recipes?${qs}` : "meals/recipes";

  return useQuery({
    queryKey: mealKeys.recipes(filters),
    queryFn: () => apiGet<PaginatedRecipes>(path),
  });
}

export function useMyRecipes() {
  return useQuery({
    queryKey: mealKeys.myRecipes,
    queryFn: () => apiGet<RecipeListItem[]>("meals/recipes/mine"),
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: mealKeys.recipe(id),
    queryFn: () => apiGet<RecipeDetail>(`meals/recipes/${id}`),
    enabled: !!id,
  });
}

// ── Recipe mutations ─────────────────────────────────────────

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecipeInput) =>
      apiPost<Recipe>("meals/recipes", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "recipes"] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateRecipeInput & { id: string }) =>
      apiPatch<Recipe>(`meals/recipes/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "recipes"] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`meals/recipes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "recipes"] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) =>
      apiPost<{ favorited: boolean }>(`meals/recipes/${recipeId}/favorite`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "recipes"] });
    },
  });
}

// ── Tag queries & mutations ──────────────────────────────────

export function useTags() {
  return useQuery({
    queryKey: mealKeys.tags,
    queryFn: () => apiGet<RecipeTag[]>("meals/tags"),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      apiPost<RecipeTag>("meals/tags", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.tags });
    },
  });
}

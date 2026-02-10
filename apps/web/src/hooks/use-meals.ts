import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import type {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  RecipeTag,
  RecipeTagLink,
  MealPlan,
  MealPlanEntry,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeFilters,
  CreateMealPlanInput,
  CreateMealPlanEntryInput,
  UpdateMealPlanEntryInput,
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

export type MealPlanListItem = MealPlan & {
  _count: { entries: number };
};

export type MealPlanEntryDetail = MealPlanEntry & {
  recipe: Recipe & {
    ingredients: RecipeIngredient[];
    tags: (RecipeTagLink & { tag: RecipeTag })[];
  };
};

export type MealPlanDetail = MealPlan & {
  entries: MealPlanEntryDetail[];
};

// ── Query keys ───────────────────────────────────────────────

export const mealKeys = {
  recipes: (filters?: RecipeFilters) => ["meals", "recipes", filters] as const,
  myRecipes: ["meals", "recipes", "mine"] as const,
  recipe: (id: string) => ["meals", "recipes", id] as const,
  tags: ["meals", "tags"] as const,
  plans: ["meals", "plans"] as const,
  plan: (id: string) => ["meals", "plans", id] as const,
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

// ── Meal Plan queries ───────────────────────────────────────

export function useMealPlans() {
  return useQuery({
    queryKey: mealKeys.plans,
    queryFn: () => apiGet<MealPlanListItem[]>("meals/plans"),
  });
}

export function useMealPlan(id: string) {
  return useQuery({
    queryKey: mealKeys.plan(id),
    queryFn: () => apiGet<MealPlanDetail>(`meals/plans/${id}`),
    enabled: !!id,
  });
}

// ── Meal Plan mutations ─────────────────────────────────────

export function useCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMealPlanInput) =>
      apiPost<MealPlanListItem>("meals/plans", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.plans });
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`meals/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.plans });
    },
  });
}

export function useCreateMealPlanEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      ...input
    }: CreateMealPlanEntryInput & { planId: string }) =>
      apiPost<MealPlanEntryDetail>(`meals/plans/${planId}/entries`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "plans"] });
    },
  });
}

export function useUpdateMealPlanEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      entryId,
      ...input
    }: UpdateMealPlanEntryInput & { planId: string; entryId: string }) =>
      apiPatch<MealPlanEntryDetail>(
        `meals/plans/${planId}/entries/${entryId}`,
        input,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "plans"] });
    },
  });
}

export function useDeleteMealPlanEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, entryId }: { planId: string; entryId: string }) =>
      apiDelete(`meals/plans/${planId}/entries/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "plans"] });
    },
  });
}

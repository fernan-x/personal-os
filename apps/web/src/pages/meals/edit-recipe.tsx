import { Stack, Button, Alert, Loader, Center } from "@mantine/core";
import { IconArrowLeft, IconToolsKitchen2 } from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router";
import { PageHeader } from "../../components/shared/page-header";
import { RecipeForm } from "../../components/meals/recipe-form";
import { useRecipe, useUpdateRecipe } from "../../hooks/use-meals";
import type { CreateRecipeInput } from "@personal-os/domain";

export function EditRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { data: recipe, isLoading, error } = useRecipe(recipeId!);
  const updateRecipe = useUpdateRecipe();

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

  function handleSubmit(values: CreateRecipeInput) {
    updateRecipe.mutate(
      { id: recipeId!, ...values },
      { onSuccess: () => navigate(`/meals/${recipeId}`) },
    );
  }

  return (
    <Stack>
      <PageHeader
        icon={IconToolsKitchen2}
        title="Modifier la recette"
        subtitle={recipe.title}
        backButton={
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(`/meals/${recipeId}`)}
          >
            Retour
          </Button>
        }
      />

      <RecipeForm
        initialValues={{
          title: recipe.title,
          description: recipe.description ?? "",
          photoUrl: recipe.photoUrl ?? undefined,
          sourceUrl: recipe.sourceUrl ?? "",
          visibility: recipe.visibility,
          difficulty: recipe.difficulty,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          ingredients: recipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            sortOrder: ing.sortOrder,
          })),
          instructions: recipe.instructions.map((ins) => ({
            stepNumber: ins.stepNumber,
            content: ins.content,
          })),
        }}
        initialTagIds={recipe.tags.map((tl) => tl.tagId)}
        onSubmit={handleSubmit}
        isSubmitting={updateRecipe.isPending}
        submitLabel="Enregistrer"
      />
    </Stack>
  );
}

import { Stack, Button } from "@mantine/core";
import { IconArrowLeft, IconToolsKitchen2 } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { PageHeader } from "../../components/shared/page-header";
import { RecipeForm } from "../../components/meals/recipe-form";
import { useCreateRecipe } from "../../hooks/use-meals";
import type { CreateRecipeInput } from "@personal-os/domain";

export function CreateRecipePage() {
  const navigate = useNavigate();
  const createRecipe = useCreateRecipe();

  function handleSubmit(values: CreateRecipeInput) {
    createRecipe.mutate(values, {
      onSuccess: () => navigate("/meals"),
    });
  }

  return (
    <Stack>
      <PageHeader
        icon={IconToolsKitchen2}
        title="Nouvelle recette"
        subtitle="Ajoutez une recette à votre livre"
        backButton={
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/meals")}
          >
            Retour
          </Button>
        }
      />

      <RecipeForm
        onSubmit={handleSubmit}
        isSubmitting={createRecipe.isPending}
        submitLabel="Créer la recette"
      />
    </Stack>
  );
}

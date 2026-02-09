import { useState } from "react";
import {
  Stack,
  Group,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  MultiSelect,
  FileInput,
  Button,
  Divider,
  Title,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconPhoto } from "@tabler/icons-react";
import {
  RECIPE_TITLE_MAX_LENGTH,
  RECIPE_DESCRIPTION_MAX_LENGTH,
  SOURCE_URL_MAX_LENGTH,
  RECIPE_VISIBILITIES,
  RECIPE_DIFFICULTIES,
  VISIBILITY_LABELS,
  DIFFICULTY_LABELS,
  MAX_SERVINGS,
  MAX_TIME_MINUTES,
  validateCreateRecipe,
  UPLOAD_ALLOWED_MIME_TYPES,
} from "@personal-os/domain";
import type { CreateRecipeInput } from "@personal-os/domain";
import { IngredientListInput } from "./ingredient-list-input";
import { InstructionListInput } from "./instruction-list-input";
import { useTags, useCreateTag } from "../../hooks/use-meals";
import { useUploadFile } from "../../hooks/use-upload";

interface RecipeFormProps {
  initialValues?: Partial<CreateRecipeInput> & { id?: string };
  initialTagIds?: string[];
  onSubmit: (values: CreateRecipeInput) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function RecipeForm({
  initialValues,
  initialTagIds,
  onSubmit,
  isSubmitting,
  submitLabel,
}: RecipeFormProps) {
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const uploadFile = useUploadFile();
  const [photo, setPhoto] = useState<File | null>(null);

  const form = useForm<CreateRecipeInput>({
    initialValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      sourceUrl: initialValues?.sourceUrl ?? "",
      visibility: initialValues?.visibility ?? "private",
      difficulty: initialValues?.difficulty ?? "medium",
      prepTime: initialValues?.prepTime ?? null,
      cookTime: initialValues?.cookTime ?? null,
      servings: initialValues?.servings ?? 4,
      calories: initialValues?.calories ?? null,
      protein: initialValues?.protein ?? null,
      carbs: initialValues?.carbs ?? null,
      fat: initialValues?.fat ?? null,
      ingredients: initialValues?.ingredients ?? [
        { name: "", quantity: 0, unit: "g", sortOrder: 0 },
      ],
      instructions: initialValues?.instructions ?? [
        { stepNumber: 1, content: "" },
      ],
      tagIds: initialTagIds ?? [],
    },
    validate: (values) => {
      const errors = validateCreateRecipe(values);
      const fieldErrors: Record<string, string> = {};
      for (const error of errors) {
        fieldErrors[error.field] = error.message;
      }
      return fieldErrors;
    },
  });

  const tagOptions = (tags ?? []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  async function handleSubmit(values: CreateRecipeInput) {
    let photoUrl = initialValues?.photoUrl;

    if (photo) {
      const result = await uploadFile.mutateAsync({
        file: photo,
        folder: "recipes",
      });
      photoUrl = result.key;
    }

    onSubmit({ ...values, photoUrl });
  }

  const [newTagName, setNewTagName] = useState("");

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    const tag = await createTag.mutateAsync(newTagName.trim());
    form.setFieldValue("tagIds", [...(form.values.tagIds ?? []), tag.id]);
    setNewTagName("");
  }

  const visibilityData = RECIPE_VISIBILITIES.map((v) => ({
    value: v,
    label: VISIBILITY_LABELS[v] ?? v,
  }));

  const difficultyData = RECIPE_DIFFICULTIES.map((d) => ({
    value: d,
    label: DIFFICULTY_LABELS[d] ?? d,
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Title order={4}>Informations générales</Title>

        <TextInput
          label="Titre"
          placeholder="ex. Poulet rôti aux herbes"
          maxLength={RECIPE_TITLE_MAX_LENGTH}
          required
          {...form.getInputProps("title")}
        />

        <Textarea
          label="Description"
          placeholder="Une brève description de la recette"
          maxLength={RECIPE_DESCRIPTION_MAX_LENGTH}
          autosize
          minRows={2}
          maxRows={4}
          {...form.getInputProps("description")}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="Visibilité"
            data={visibilityData}
            {...form.getInputProps("visibility")}
          />
          <Select
            label="Difficulté"
            data={difficultyData}
            {...form.getInputProps("difficulty")}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="URL source"
            placeholder="https://..."
            maxLength={SOURCE_URL_MAX_LENGTH}
            {...form.getInputProps("sourceUrl")}
          />
          <FileInput
            label="Photo"
            placeholder="Choisir une photo"
            accept={UPLOAD_ALLOWED_MIME_TYPES.join(",")}
            value={photo}
            onChange={setPhoto}
            clearable
            leftSection={<IconPhoto size={16} />}
          />
        </SimpleGrid>

        <MultiSelect
          label="Tags"
          placeholder="Sélectionner des tags"
          data={tagOptions}
          searchable
          {...form.getInputProps("tagIds")}
        />
        <Group gap="xs">
          <TextInput
            placeholder="Nouveau tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            variant="light"
            size="sm"
            onClick={handleCreateTag}
            loading={createTag.isPending}
          >
            Créer le tag
          </Button>
        </Group>

        <Divider />
        <Title order={4}>Temps & portions</Title>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <NumberInput
            label="Temps de préparation (min)"
            placeholder="ex. 15"
            min={0}
            max={MAX_TIME_MINUTES}
            {...form.getInputProps("prepTime")}
          />
          <NumberInput
            label="Temps de cuisson (min)"
            placeholder="ex. 30"
            min={0}
            max={MAX_TIME_MINUTES}
            {...form.getInputProps("cookTime")}
          />
          <NumberInput
            label="Portions"
            placeholder="ex. 4"
            min={1}
            max={MAX_SERVINGS}
            {...form.getInputProps("servings")}
          />
        </SimpleGrid>

        <Divider />
        <Title order={4}>Macros (par portion)</Title>

        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <NumberInput
            label="Calories (kcal)"
            placeholder="—"
            min={0}
            {...form.getInputProps("calories")}
          />
          <NumberInput
            label="Protéines (g)"
            placeholder="—"
            min={0}
            {...form.getInputProps("protein")}
          />
          <NumberInput
            label="Glucides (g)"
            placeholder="—"
            min={0}
            {...form.getInputProps("carbs")}
          />
          <NumberInput
            label="Lipides (g)"
            placeholder="—"
            min={0}
            {...form.getInputProps("fat")}
          />
        </SimpleGrid>

        <Divider />

        <IngredientListInput
          value={form.values.ingredients}
          onChange={(v) => form.setFieldValue("ingredients", v)}
          error={form.errors.ingredients as string | undefined}
        />

        <Divider />

        <InstructionListInput
          value={form.values.instructions}
          onChange={(v) => form.setFieldValue("instructions", v)}
          error={form.errors.instructions as string | undefined}
        />

        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            loading={isSubmitting || uploadFile.isPending}
            leftSection={<IconCheck size={16} />}
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

import {
  Stack,
  Group,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Button,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash, IconGripVertical } from "@tabler/icons-react";
import type { RecipeIngredientInput } from "@personal-os/domain";
import {
  INGREDIENT_UNITS,
  INGREDIENT_UNIT_LABELS,
  INGREDIENT_NAME_MAX_LENGTH,
} from "@personal-os/domain";

interface IngredientListInputProps {
  value: RecipeIngredientInput[];
  onChange: (value: RecipeIngredientInput[]) => void;
  error?: string;
}

const unitOptions = INGREDIENT_UNITS.map((u) => ({
  value: u,
  label: INGREDIENT_UNIT_LABELS[u] ?? u,
}));

export function IngredientListInput({
  value,
  onChange,
  error,
}: IngredientListInputProps) {
  function addIngredient() {
    onChange([
      ...value,
      { name: "", quantity: 0, unit: "g" as const, sortOrder: value.length },
    ]);
  }

  function removeIngredient(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next.map((ing, i) => ({ ...ing, sortOrder: i })));
  }

  function updateIngredient(
    index: number,
    field: keyof RecipeIngredientInput,
    val: unknown,
  ) {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  }

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        Ingrédients
      </Text>
      {value.map((ing, i) => (
        <Group key={i} gap="xs" align="flex-end" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            style={{ cursor: "grab" }}
          >
            <IconGripVertical size={14} />
          </ActionIcon>
          <TextInput
            placeholder="Nom de l'ingrédient"
            value={ing.name}
            onChange={(e) => updateIngredient(i, "name", e.currentTarget.value)}
            maxLength={INGREDIENT_NAME_MAX_LENGTH}
            style={{ flex: 2 }}
          />
          <NumberInput
            placeholder="Qté"
            value={ing.quantity || ""}
            onChange={(val) =>
              updateIngredient(i, "quantity", typeof val === "number" ? val : 0)
            }
            min={0.01}
            step={0.5}
            decimalScale={2}
            style={{ width: 100 }}
          />
          <Select
            data={unitOptions}
            value={ing.unit}
            onChange={(val) => updateIngredient(i, "unit", val ?? "g")}
            style={{ width: 110 }}
          />
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => removeIngredient(i)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
      <Button
        variant="light"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={addIngredient}
      >
        Ajouter un ingrédient
      </Button>
    </Stack>
  );
}

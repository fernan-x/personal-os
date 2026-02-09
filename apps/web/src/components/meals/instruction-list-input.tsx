import {
  Stack,
  Group,
  Textarea,
  ActionIcon,
  Button,
  Text,
  Badge,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { RecipeInstructionInput } from "@personal-os/domain";
import { INSTRUCTION_CONTENT_MAX_LENGTH } from "@personal-os/domain";

interface InstructionListInputProps {
  value: RecipeInstructionInput[];
  onChange: (value: RecipeInstructionInput[]) => void;
  error?: string;
}

export function InstructionListInput({
  value,
  onChange,
  error,
}: InstructionListInputProps) {
  function addInstruction() {
    onChange([
      ...value,
      { stepNumber: value.length + 1, content: "" },
    ]);
  }

  function removeInstruction(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next.map((ins, i) => ({ ...ins, stepNumber: i + 1 })));
  }

  function updateContent(index: number, content: string) {
    const next = [...value];
    next[index] = { ...next[index], content };
    onChange(next);
  }

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        Instructions
      </Text>
      {value.map((ins, i) => (
        <Group key={i} gap="xs" align="flex-start" wrap="nowrap">
          <Badge
            variant="filled"
            color="teal"
            size="lg"
            circle
            mt={6}
          >
            {i + 1}
          </Badge>
          <Textarea
            placeholder={`Étape ${i + 1}`}
            value={ins.content}
            onChange={(e) => updateContent(i, e.currentTarget.value)}
            maxLength={INSTRUCTION_CONTENT_MAX_LENGTH}
            autosize
            minRows={2}
            maxRows={6}
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="subtle"
            color="red"
            mt={6}
            onClick={() => removeInstruction(i)}
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
        onClick={addInstruction}
      >
        Ajouter une étape
      </Button>
    </Stack>
  );
}

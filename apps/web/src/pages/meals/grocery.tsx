import { useState, useCallback, useMemo } from "react";
import {
  Stack,
  Alert,
  Loader,
  Center,
  Group,
  ActionIcon,
  Checkbox,
  Text,
  Card,
  Button,
  Progress,
  Badge,
} from "@mantine/core";
import { IconArrowLeft, IconShoppingCart, IconTrash } from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router";
import { INGREDIENT_UNIT_LABELS } from "@personal-os/domain";
import { useGroceryList } from "../../hooks/use-meals";
import { PageHeader } from "../../components/shared/page-header";

function useCheckedState(planId: string) {
  const storageKey = `grocery-checked:${planId}`;

  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback(
    (key: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        localStorage.setItem(storageKey, JSON.stringify([...next]));
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    setChecked(new Set());
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { checked, toggle, reset };
}

function formatQuantity(quantity: number): string {
  const rounded = Math.round(quantity * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(rounded < 10 ? 1 : 0);
}

export function GroceryPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { data: items, isLoading, error } = useGroceryList(planId!);
  const { checked, toggle, reset } = useCheckedState(planId!);

  const { pending, done } = useMemo(() => {
    if (!items) return { pending: [], done: [] };
    const p: typeof items = [];
    const d: typeof items = [];
    for (const item of items) {
      const key = `${item.name}::${item.unit}`;
      if (checked.has(key)) {
        d.push(item);
      } else {
        p.push(item);
      }
    }
    return { pending: p, done: d };
  }, [items, checked]);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Erreur de chargement">
        {error.message}
      </Alert>
    );
  }

  if (!items) return null;

  const total = items.length;
  const checkedCount = done.length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;

  return (
    <Stack>
      <PageHeader
        icon={IconShoppingCart}
        title="Liste de courses"
        backButton={
          <ActionIcon
            variant="subtle"
            onClick={() => navigate(`/meals/plans/${planId}`)}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
        }
        actions={
          <Group gap="xs">
            <Badge size="lg" variant="light" color={checkedCount === total ? "green" : "blue"}>
              {checkedCount}/{total}
            </Badge>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              leftSection={<IconTrash size={14} />}
              onClick={reset}
              disabled={checkedCount === 0}
            >
              Reinitialiser
            </Button>
          </Group>
        }
      />

      <Progress value={progress} size="sm" color={checkedCount === total ? "green" : "blue"} />

      {total === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Aucun ingredient dans ce meal plan.
        </Text>
      )}

      {pending.length > 0 && (
        <Stack gap="xs">
          {pending.map((item) => {
            const key = `${item.name}::${item.unit}`;
            return (
              <GroceryItemCard
                key={key}
                item={item}
                isChecked={false}
                onToggle={() => toggle(key)}
              />
            );
          })}
        </Stack>
      )}

      {done.length > 0 && (
        <Stack gap="xs" mt="md">
          <Text size="sm" fw={600} c="dimmed">
            Fait ({done.length})
          </Text>
          {done.map((item) => {
            const key = `${item.name}::${item.unit}`;
            return (
              <GroceryItemCard
                key={key}
                item={item}
                isChecked={true}
                onToggle={() => toggle(key)}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

interface GroceryItemCardProps {
  item: { name: string; quantity: number; unit: string; recipes: string[] };
  isChecked: boolean;
  onToggle: () => void;
}

function GroceryItemCard({ item, isChecked, onToggle }: GroceryItemCardProps) {
  const unitLabel = INGREDIENT_UNIT_LABELS[item.unit] ?? item.unit;

  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      style={{
        opacity: isChecked ? 0.5 : 1,
        cursor: "pointer",
      }}
      onClick={onToggle}
    >
      <Group wrap="nowrap" align="flex-start">
        <Checkbox
          checked={isChecked}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          mt={2}
        />
        <div style={{ flex: 1 }}>
          <Text
            size="sm"
            fw={500}
            td={isChecked ? "line-through" : undefined}
          >
            {item.name}
            <Text component="span" c="dimmed" ml={6}>
              {formatQuantity(item.quantity)} {unitLabel}
            </Text>
          </Text>
          <Text size="xs" c="dimmed">
            {item.recipes.join(", ")}
          </Text>
        </div>
      </Group>
    </Card>
  );
}

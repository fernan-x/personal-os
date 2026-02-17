import { useState } from "react";
import {
  Modal,
  Stack,
  Table,
  TextInput,
  Switch,
  Button,
  Group,
  ActionIcon,
  Badge,
  Text,
} from "@mantine/core";
import { IconCheck, IconTrash, IconX, IconPencil, IconPlus } from "@tabler/icons-react";
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from "../../hooks/use-budget";
import type { ExpenseCategory } from "@personal-os/domain";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function CategoryManagementModal({ opened, onClose }: Props) {
  const { data: categories } = useExpenseCategories();
  const createCategory = useCreateExpenseCategory();
  const updateCategory = useUpdateExpenseCategory();
  const deleteCategory = useDeleteExpenseCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newAutoCreate, setNewAutoCreate] = useState(false);

  function startEdit(cat: ExpenseCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    updateCategory.mutate(
      { id: editingId, name: editName.trim(), icon: editIcon.trim() || null },
      { onSuccess: () => cancelEdit() },
    );
  }

  function handleAutoCreateToggle(cat: ExpenseCategory & { autoCreateEnvelope?: boolean }) {
    updateCategory.mutate({
      id: cat.id,
      autoCreateEnvelope: !cat.autoCreateEnvelope,
    });
  }

  function handleDelete(id: string) {
    deleteCategory.mutate(id);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createCategory.mutate(
      {
        name: newName.trim(),
        icon: newIcon.trim() || undefined,
        autoCreateEnvelope: newAutoCreate,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewIcon("");
          setNewAutoCreate(false);
        },
      },
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Gérer les catégories" size="lg">
      <Stack>
        {categories && categories.length > 0 && (
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Icône</Table.Th>
                <Table.Th>Nom</Table.Th>
                <Table.Th>Auto-enveloppe</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {categories.map((cat) => (
                <Table.Tr key={cat.id}>
                  {editingId === cat.id ? (
                    <>
                      <Table.Td>
                        <TextInput
                          size="xs"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.currentTarget.value)}
                          placeholder="Icône"
                          style={{ width: 80 }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <TextInput
                          size="xs"
                          value={editName}
                          onChange={(e) => setEditName(e.currentTarget.value)}
                          placeholder="Nom"
                        />
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={(cat as ExpenseCategory & { autoCreateEnvelope?: boolean }).autoCreateEnvelope ?? false}
                          onChange={() => handleAutoCreateToggle(cat as ExpenseCategory & { autoCreateEnvelope?: boolean })}
                          size="sm"
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon color="green" variant="subtle" size="sm" onClick={saveEdit}>
                            <IconCheck size={14} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" size="sm" onClick={cancelEdit}>
                            <IconX size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </>
                  ) : (
                    <>
                      <Table.Td>{cat.icon ?? "-"}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {cat.name}
                          {cat.isDefault && (
                            <Badge size="xs" variant="light">
                              Défaut
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={(cat as ExpenseCategory & { autoCreateEnvelope?: boolean }).autoCreateEnvelope ?? false}
                          onChange={() => handleAutoCreateToggle(cat as ExpenseCategory & { autoCreateEnvelope?: boolean })}
                          size="sm"
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" size="sm" onClick={() => startEdit(cat)}>
                            <IconPencil size={14} />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            onClick={() => handleDelete(cat.id)}
                            disabled={cat.isDefault}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        <Text fw={500} size="sm" mt="md">
          Ajouter une catégorie
        </Text>
        <form onSubmit={handleAdd}>
          <Group gap="xs" align="end">
            <TextInput
              label="Icône"
              value={newIcon}
              onChange={(e) => setNewIcon(e.currentTarget.value)}
              placeholder="ex. 🍔"
              style={{ width: 80 }}
            />
            <TextInput
              label="Nom"
              value={newName}
              onChange={(e) => setNewName(e.currentTarget.value)}
              placeholder="ex. Transport"
              style={{ flex: 1 }}
              required
            />
            <Switch
              label="Auto-enveloppe"
              checked={newAutoCreate}
              onChange={(e) => setNewAutoCreate(e.currentTarget.checked)}
            />
            <Button type="submit" loading={createCategory.isPending} leftSection={<IconPlus size={16} />}>
              Ajouter
            </Button>
          </Group>
        </form>
      </Stack>
    </Modal>
  );
}

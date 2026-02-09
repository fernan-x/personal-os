import { Modal, TextInput, Button, Stack, FileInput } from "@mantine/core";
import { IconCheck, IconPhoto } from "@tabler/icons-react";
import { useState } from "react";
import { useCreatePet } from "../../hooks/use-puppy";
import { useUploadFile } from "../../hooks/use-upload";
import { UPLOAD_ALLOWED_MIME_TYPES } from "@personal-os/domain";

interface Props {
  householdId: string;
  opened: boolean;
  onClose: () => void;
}

export function CreatePetModal({ householdId, opened, onClose }: Props) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const createPet = useCreatePet(householdId);
  const uploadFile = useUploadFile();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let photoUrl: string | undefined;
    if (photo) {
      const result = await uploadFile.mutateAsync({
        file: photo,
        folder: "pets",
      });
      photoUrl = result.key;
    }

    createPet.mutate(
      {
        name,
        breed: breed || undefined,
        birthDate: birthDate || undefined,
        photoUrl,
      },
      {
        onSuccess: () => {
          setName("");
          setBreed("");
          setBirthDate("");
          setPhoto(null);
          onClose();
        },
      },
    );
  }

  const isLoading = uploadFile.isPending || createPet.isPending;

  return (
    <Modal opened={opened} onClose={onClose} title="Ajouter un animal">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nom"
            placeholder="ex. Max"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Race"
            placeholder="ex. Golden Retriever"
            value={breed}
            onChange={(e) => setBreed(e.currentTarget.value)}
          />
          <TextInput
            label="Date de naissance"
            placeholder="JJ/MM/AAAA"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.currentTarget.value)}
          />
          <FileInput
            label="Photo"
            placeholder="Choisir une photo"
            accept={UPLOAD_ALLOWED_MIME_TYPES.join(",")}
            leftSection={<IconPhoto size={16} />}
            value={photo}
            onChange={setPhoto}
            clearable
          />
          <Button type="submit" loading={isLoading} leftSection={<IconCheck size={16} />}>
            Ajouter
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

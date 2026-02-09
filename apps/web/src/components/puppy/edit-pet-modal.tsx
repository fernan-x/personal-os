import { Modal, TextInput, Button, Stack, FileInput, Image } from "@mantine/core";
import { IconCheck, IconPhoto } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useUpdatePet } from "../../hooks/use-puppy";
import { useUploadFile } from "../../hooks/use-upload";
import { UPLOAD_ALLOWED_MIME_TYPES } from "@personal-os/domain";
import type { Pet } from "@personal-os/domain";

interface Props {
  householdId: string;
  pet: Pet;
  opened: boolean;
  onClose: () => void;
}

function toDateString(val: string | Date | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? val : val.toISOString();
  return d.split("T")[0];
}

export function EditPetModal({ householdId, pet, opened, onClose }: Props) {
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed || "");
  const [birthDate, setBirthDate] = useState(toDateString(pet.birthDate));
  const [photo, setPhoto] = useState<File | null>(null);
  const updatePet = useUpdatePet(householdId, pet.id);
  const uploadFile = useUploadFile();

  useEffect(() => {
    setName(pet.name);
    setBreed(pet.breed || "");
    setBirthDate(toDateString(pet.birthDate));
    setPhoto(null);
  }, [pet]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let photoUrl: string | null | undefined;
    if (photo) {
      const result = await uploadFile.mutateAsync({
        file: photo,
        folder: "pets",
      });
      photoUrl = result.key;
    }

    updatePet.mutate(
      {
        name,
        breed: breed || null,
        birthDate: birthDate || null,
        ...(photoUrl !== undefined && { photoUrl }),
      },
      { onSuccess: onClose },
    );
  }

  const isLoading = uploadFile.isPending || updatePet.isPending;

  return (
    <Modal opened={opened} onClose={onClose} title="Modifier l'animal">
      <form onSubmit={handleSubmit}>
        <Stack>
          {pet.photoUrl && !photo && (
            <Image
              src={pet.photoUrl}
              alt={pet.name}
              radius="md"
              h={160}
              fit="cover"
            />
          )}
          <TextInput
            label="Nom"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Race"
            value={breed}
            onChange={(e) => setBreed(e.currentTarget.value)}
          />
          <TextInput
            label="Date de naissance"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.currentTarget.value)}
          />
          <FileInput
            label="Photo"
            placeholder={pet.photoUrl ? "Changer la photo" : "Choisir une photo"}
            accept={UPLOAD_ALLOWED_MIME_TYPES.join(",")}
            leftSection={<IconPhoto size={16} />}
            value={photo}
            onChange={setPhoto}
            clearable
          />
          <Button type="submit" loading={isLoading} leftSection={<IconCheck size={16} />}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

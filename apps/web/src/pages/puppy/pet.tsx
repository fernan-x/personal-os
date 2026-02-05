import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  Alert,
  Tabs,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useNavigate } from "react-router";
import { usePet } from "../../hooks/use-puppy";
import { EditPetModal } from "../../components/puppy/edit-pet-modal";
import { RoutineSetup } from "../../components/puppy/routine-setup";
import { ActivityFeed } from "../../components/puppy/activity-feed";
import { LogActivityModal } from "../../components/puppy/log-activity-modal";
import { WeightChart } from "../../components/puppy/weight-chart";
import { LogWeightModal } from "../../components/puppy/log-weight-modal";
import { VetVisitList } from "../../components/puppy/vet-visit-list";
import { AddVetVisitModal } from "../../components/puppy/add-vet-visit-modal";
import { VaccinationList } from "../../components/puppy/vaccination-list";
import { AddVaccinationModal } from "../../components/puppy/add-vaccination-modal";
import { MedicationList } from "../../components/puppy/medication-list";
import { AddMedicationModal } from "../../components/puppy/add-medication-modal";
import { TrainingBoard } from "../../components/puppy/training-board";
import { AddMilestoneModal } from "../../components/puppy/add-milestone-modal";
import { PetDashboardSummary } from "../../components/puppy/pet-dashboard-summary";

export function PetPage() {
  const { householdId, petId } = useParams<{
    householdId: string;
    petId: string;
  }>();
  const navigate = useNavigate();
  const { data: pet, isLoading } = usePet(householdId!, petId!);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [activityOpened, { open: openActivity, close: closeActivity }] =
    useDisclosure(false);
  const [weightOpened, { open: openWeight, close: closeWeight }] =
    useDisclosure(false);
  const [vetOpened, { open: openVet, close: closeVet }] =
    useDisclosure(false);
  const [vaxOpened, { open: openVax, close: closeVax }] =
    useDisclosure(false);
  const [medOpened, { open: openMed, close: closeMed }] =
    useDisclosure(false);
  const [milestoneOpened, { open: openMilestone, close: closeMilestone }] =
    useDisclosure(false);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!pet) {
    return <Alert color="red">Pet not found</Alert>;
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <div>
          <Group gap="sm" align="center">
            <Title>{pet.name}</Title>
            {pet.breed && (
              <Badge variant="light" size="lg">
                {pet.breed}
              </Badge>
            )}
          </Group>
          {pet.birthDate && (
            <Text c="dimmed" size="sm">
              Born {new Date(pet.birthDate).toLocaleDateString()}
            </Text>
          )}
        </div>
        <Group>
          <Button variant="subtle" size="sm" onClick={openEdit}>
            Edit
          </Button>
          <Button
            variant="subtle"
            onClick={() => navigate(`/puppy/${householdId}`)}
          >
            Back to household
          </Button>
        </Group>
      </Group>

      <PetDashboardSummary householdId={householdId!} petId={petId!} />

      <Tabs defaultValue="activity">
        <Tabs.List>
          <Tabs.Tab value="activity">Activity</Tabs.Tab>
          <Tabs.Tab value="growth">Growth</Tabs.Tab>
          <Tabs.Tab value="health">Health</Tabs.Tab>
          <Tabs.Tab value="training">Training</Tabs.Tab>
          <Tabs.Tab value="routines">Routines</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="activity" pt="md">
          <Stack>
            <Group justify="flex-end">
              <Button size="sm" onClick={openActivity}>
                Log Activity
              </Button>
            </Group>
            <ActivityFeed householdId={householdId!} petId={petId!} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="growth" pt="md">
          <Stack>
            <Group justify="flex-end">
              <Button size="sm" onClick={openWeight}>
                Log Weight
              </Button>
            </Group>
            <WeightChart householdId={householdId!} petId={petId!} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="health" pt="md">
          <Stack>
            <Group justify="space-between">
              <Text fw={500}>Vet Visits</Text>
              <Button size="xs" onClick={openVet}>Add Vet Visit</Button>
            </Group>
            <VetVisitList householdId={householdId!} petId={petId!} />

            <Group justify="space-between" mt="md">
              <Text fw={500}>Vaccinations</Text>
              <Button size="xs" onClick={openVax}>Add Vaccination</Button>
            </Group>
            <VaccinationList householdId={householdId!} petId={petId!} />

            <Group justify="space-between" mt="md">
              <Text fw={500}>Medications</Text>
              <Button size="xs" onClick={openMed}>Add Medication</Button>
            </Group>
            <MedicationList householdId={householdId!} petId={petId!} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="training" pt="md">
          <Stack>
            <Group justify="flex-end">
              <Button size="sm" onClick={openMilestone}>
                Add Goal
              </Button>
            </Group>
            <TrainingBoard householdId={householdId!} petId={petId!} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="routines" pt="md">
          <RoutineSetup householdId={householdId!} petId={petId!} />
        </Tabs.Panel>
      </Tabs>

      <EditPetModal
        householdId={householdId!}
        pet={pet}
        opened={editOpened}
        onClose={closeEdit}
      />
      <LogActivityModal
        householdId={householdId!}
        petId={petId!}
        opened={activityOpened}
        onClose={closeActivity}
      />
      <LogWeightModal
        householdId={householdId!}
        petId={petId!}
        opened={weightOpened}
        onClose={closeWeight}
      />
      <AddVetVisitModal
        householdId={householdId!}
        petId={petId!}
        opened={vetOpened}
        onClose={closeVet}
      />
      <AddVaccinationModal
        householdId={householdId!}
        petId={petId!}
        opened={vaxOpened}
        onClose={closeVax}
      />
      <AddMedicationModal
        householdId={householdId!}
        petId={petId!}
        opened={medOpened}
        onClose={closeMed}
      />
      <AddMilestoneModal
        householdId={householdId!}
        petId={petId!}
        opened={milestoneOpened}
        onClose={closeMilestone}
      />
    </Stack>
  );
}

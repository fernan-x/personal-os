import {
  PrismaClient,
  HabitFrequency,
  ActivityType,
  TrainingStatus,
  MedicationFrequency,
} from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "utensils" },
  { name: "Transport", icon: "car" },
  { name: "Housing", icon: "home" },
  { name: "Utilities", icon: "bolt" },
  { name: "Healthcare", icon: "heart" },
  { name: "Entertainment", icon: "film" },
  { name: "Shopping", icon: "shopping-cart" },
  { name: "Savings", icon: "piggy-bank" },
  { name: "Other", icon: "ellipsis" },
];

async function main() {
  const password = await hash("password123", BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: "test@personal-os.dev" },
    update: {},
    create: {
      email: "test@personal-os.dev",
      name: "Test User",
      password,
      isActive: true,
      habits: {
        create: [
          {
            name: "Morning meditation",
            description: "10 minutes of mindfulness meditation",
            frequency: HabitFrequency.daily,
          },
          {
            name: "Exercise",
            description: "At least 30 minutes of physical activity",
            frequency: HabitFrequency.daily,
          },
          {
            name: "Read",
            description: "Read for at least 20 minutes",
            frequency: HabitFrequency.daily,
          },
          {
            name: "Weekly review",
            description: "Review goals and plan the upcoming week",
            frequency: HabitFrequency.weekly,
          },
        ],
      },
    },
  });

  console.log(`Seeded user: ${user.email} (active: ${user.isActive})`);

  const habits = await prisma.habit.findMany({ where: { userId: user.id } });
  console.log(`Seeded ${habits.length} habits`);

  // Seed default expense categories
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        isDefault: true,
      },
    });
  }

  const categories = await prisma.expenseCategory.count();
  console.log(`Seeded ${categories} expense categories`);

  // ── Puppy Tracker Seed Data ───────────────────────────────────

  // Create household with test user
  const household = await prisma.household.upsert({
    where: { id: "seed-household-1" },
    update: {},
    create: {
      id: "seed-household-1",
      name: "Our Home",
      members: {
        create: { userId: user.id },
      },
    },
  });
  console.log(`Seeded household: ${household.name}`);

  // Create pet (3-month old Golden Retriever)
  const birthDate = new Date();
  birthDate.setMonth(birthDate.getMonth() - 3);

  const pet = await prisma.pet.upsert({
    where: { id: "seed-pet-max" },
    update: {},
    create: {
      id: "seed-pet-max",
      householdId: household.id,
      name: "Max",
      breed: "Golden Retriever",
      birthDate,
    },
  });
  console.log(`Seeded pet: ${pet.name}`);

  // Create 5 routine templates
  const routineTemplates = [
    { name: "Morning meal", time: "08:00", type: ActivityType.meal, sortOrder: 0 },
    { name: "Morning walk", time: "09:00", type: ActivityType.walk, sortOrder: 1 },
    { name: "Lunch meal", time: "12:30", type: ActivityType.meal, sortOrder: 2 },
    { name: "Evening walk", time: "18:00", type: ActivityType.walk, sortOrder: 3 },
    { name: "Evening meal", time: "19:00", type: ActivityType.meal, sortOrder: 4 },
  ];

  for (const template of routineTemplates) {
    await prisma.routineTemplate.upsert({
      where: { id: `seed-routine-${template.sortOrder}` },
      update: {},
      create: {
        id: `seed-routine-${template.sortOrder}`,
        petId: pet.id,
        ...template,
      },
    });
  }
  console.log(`Seeded ${routineTemplates.length} routine templates`);

  // Create 10 activity logs (past few days)
  const activityLogs = [
    { type: ActivityType.walk, duration: 30, note: "Park walk", daysAgo: 0 },
    { type: ActivityType.meal, note: "Morning meal", daysAgo: 0 },
    { type: ActivityType.potty, daysAgo: 0 },
    { type: ActivityType.walk, duration: 45, note: "Long evening walk", daysAgo: 1 },
    { type: ActivityType.meal, note: "Evening meal", daysAgo: 1 },
    { type: ActivityType.grooming, duration: 20, note: "Brushing", daysAgo: 1 },
    { type: ActivityType.walk, duration: 25, daysAgo: 2 },
    { type: ActivityType.meal, daysAgo: 2 },
    { type: ActivityType.sleep, duration: 120, note: "Afternoon nap", daysAgo: 2 },
    { type: ActivityType.potty, daysAgo: 2 },
  ];

  for (let i = 0; i < activityLogs.length; i++) {
    const log = activityLogs[i];
    const loggedAt = new Date();
    loggedAt.setDate(loggedAt.getDate() - log.daysAgo);
    loggedAt.setHours(8 + i % 12, 0, 0, 0);

    await prisma.activityLog.upsert({
      where: { id: `seed-activity-${i}` },
      update: {},
      create: {
        id: `seed-activity-${i}`,
        petId: pet.id,
        userId: user.id,
        type: log.type,
        duration: log.duration ?? null,
        note: log.note ?? null,
        loggedAt,
      },
    });
  }
  console.log(`Seeded ${activityLogs.length} activity logs`);

  // Create 5 weight entries (weekly progression)
  const weightEntries = [
    { weeksAgo: 4, weight: 4500 },  // 4.5 kg
    { weeksAgo: 3, weight: 5200 },  // 5.2 kg
    { weeksAgo: 2, weight: 5900 },  // 5.9 kg
    { weeksAgo: 1, weight: 6500 },  // 6.5 kg
    { weeksAgo: 0, weight: 7100 },  // 7.1 kg
  ];

  for (let i = 0; i < weightEntries.length; i++) {
    const entry = weightEntries[i];
    const date = new Date();
    date.setDate(date.getDate() - entry.weeksAgo * 7);

    await prisma.weightEntry.upsert({
      where: { id: `seed-weight-${i}` },
      update: {},
      create: {
        id: `seed-weight-${i}`,
        petId: pet.id,
        weight: entry.weight,
        date,
      },
    });
  }
  console.log(`Seeded ${weightEntries.length} weight entries`);

  // Create 2 vet visits
  const vetVisits = [
    {
      daysAgo: 60,
      reason: "First puppy checkup",
      notes: "Healthy puppy, good weight gain",
      nextDaysFromNow: 30,
    },
    {
      daysAgo: 30,
      reason: "Vaccination visit",
      notes: "DHPP vaccine administered",
      nextDaysFromNow: 60,
    },
  ];

  for (let i = 0; i < vetVisits.length; i++) {
    const visit = vetVisits[i];
    const date = new Date();
    date.setDate(date.getDate() - visit.daysAgo);
    const nextVisitDate = new Date();
    nextVisitDate.setDate(nextVisitDate.getDate() + visit.nextDaysFromNow);

    await prisma.vetVisit.upsert({
      where: { id: `seed-vet-${i}` },
      update: {},
      create: {
        id: `seed-vet-${i}`,
        petId: pet.id,
        date,
        reason: visit.reason,
        notes: visit.notes,
        nextVisitDate,
      },
    });
  }
  console.log(`Seeded ${vetVisits.length} vet visits`);

  // Create 3 vaccinations
  const vaccinations = [
    { name: "DHPP", daysAgo: 60, nextDueInDays: 30 },
    { name: "Rabies", daysAgo: 30, nextDueInDays: 335 },
    { name: "Bordetella", daysAgo: 30, nextDueInDays: 150 },
  ];

  for (let i = 0; i < vaccinations.length; i++) {
    const vax = vaccinations[i];
    const date = new Date();
    date.setDate(date.getDate() - vax.daysAgo);
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + vax.nextDueInDays);

    await prisma.vaccination.upsert({
      where: { id: `seed-vax-${i}` },
      update: {},
      create: {
        id: `seed-vax-${i}`,
        petId: pet.id,
        name: vax.name,
        date,
        nextDueDate,
      },
    });
  }
  console.log(`Seeded ${vaccinations.length} vaccinations`);

  // Create 1 medication
  const medStartDate = new Date();
  medStartDate.setDate(medStartDate.getDate() - 14);

  await prisma.medication.upsert({
    where: { id: "seed-med-1" },
    update: {},
    create: {
      id: "seed-med-1",
      petId: pet.id,
      name: "Heartgard Plus",
      dosage: "1 chewable tablet",
      frequency: MedicationFrequency.once_daily,
      startDate: medStartDate,
      notes: "Monthly heartworm prevention",
    },
  });
  console.log(`Seeded 1 medication`);

  // Create 6 training milestones
  const trainingMilestones = [
    { command: "Sit", status: TrainingStatus.learned, daysAgo: 30 },
    { command: "Stay", status: TrainingStatus.learned, daysAgo: 14 },
    { command: "Come", status: TrainingStatus.in_progress },
    { command: "Down", status: TrainingStatus.in_progress },
    { command: "Leave it", status: TrainingStatus.not_started },
    { command: "Heel", status: TrainingStatus.not_started },
  ];

  for (let i = 0; i < trainingMilestones.length; i++) {
    const milestone = trainingMilestones[i];
    const dateAchieved =
      milestone.status === TrainingStatus.learned && milestone.daysAgo
        ? new Date(Date.now() - milestone.daysAgo * 24 * 60 * 60 * 1000)
        : null;

    await prisma.trainingMilestone.upsert({
      where: { id: `seed-training-${i}` },
      update: {},
      create: {
        id: `seed-training-${i}`,
        petId: pet.id,
        command: milestone.command,
        status: milestone.status,
        dateAchieved,
      },
    });
  }
  console.log(`Seeded ${trainingMilestones.length} training milestones`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

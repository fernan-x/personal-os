import {
  PrismaClient,
  HabitFrequency,
  ActivityType,
  TrainingStatus,
  MedicationFrequency,
  RecipeDifficulty,
  IngredientUnit,
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

  // ── Meals: Recipe Tags + Seed Recipes ─────────────────────────

  const seedTags = [
    { id: "seed-tag-rapide", name: "Rapide" },
    { id: "seed-tag-vegetarien", name: "Végétarien" },
    { id: "seed-tag-batch", name: "Batch cooking" },
    { id: "seed-tag-proteine", name: "Protéiné" },
    { id: "seed-tag-healthy", name: "Healthy" },
    { id: "seed-tag-comfort", name: "Comfort food" },
  ];

  for (const tag of seedTags) {
    await prisma.recipeTag.upsert({
      where: { id: tag.id },
      update: {},
      create: tag,
    });
  }
  console.log(`Seeded ${seedTags.length} recipe tags`);

  const seedRecipes = [
    {
      id: "seed-recipe-1",
      title: "Omelette aux fines herbes",
      description: "Une omelette classique aux herbes fraîches, parfaite pour un petit-déjeuner rapide.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.easy,
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      calories: 280,
      protein: 18,
      carbs: 2,
      fat: 22,
      tagIds: ["seed-tag-rapide", "seed-tag-vegetarien"],
      ingredients: [
        { name: "Oeufs", quantity: 4, unit: IngredientUnit.piece, sortOrder: 0 },
        { name: "Ciboulette", quantity: 2, unit: IngredientUnit.tbsp, sortOrder: 1 },
        { name: "Persil", quantity: 1, unit: IngredientUnit.tbsp, sortOrder: 2 },
        { name: "Beurre", quantity: 20, unit: IngredientUnit.g, sortOrder: 3 },
        { name: "Sel", quantity: 1, unit: IngredientUnit.pinch, sortOrder: 4 },
        { name: "Poivre", quantity: 1, unit: IngredientUnit.pinch, sortOrder: 5 },
      ],
      instructions: [
        { stepNumber: 1, content: "Battre les oeufs dans un bol avec le sel et le poivre." },
        { stepNumber: 2, content: "Ciseler finement la ciboulette et le persil, les ajouter aux oeufs." },
        { stepNumber: 3, content: "Faire fondre le beurre dans une poêle à feu moyen." },
        { stepNumber: 4, content: "Verser le mélange d'oeufs et cuire en ramenant les bords vers le centre." },
        { stepNumber: 5, content: "Plier l'omelette et servir immédiatement." },
      ],
    },
    {
      id: "seed-recipe-2",
      title: "Poulet rôti aux légumes",
      description: "Un poulet rôti doré accompagné de légumes de saison.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.medium,
      prepTime: 20,
      cookTime: 60,
      servings: 4,
      calories: 450,
      protein: 42,
      carbs: 25,
      fat: 20,
      tagIds: ["seed-tag-proteine", "seed-tag-comfort"],
      ingredients: [
        { name: "Poulet entier", quantity: 1.5, unit: IngredientUnit.kg, sortOrder: 0 },
        { name: "Pommes de terre", quantity: 500, unit: IngredientUnit.g, sortOrder: 1 },
        { name: "Carottes", quantity: 300, unit: IngredientUnit.g, sortOrder: 2 },
        { name: "Oignons", quantity: 2, unit: IngredientUnit.piece, sortOrder: 3 },
        { name: "Huile d'olive", quantity: 3, unit: IngredientUnit.tbsp, sortOrder: 4 },
        { name: "Thym frais", quantity: 4, unit: IngredientUnit.piece, sortOrder: 5 },
        { name: "Ail", quantity: 4, unit: IngredientUnit.piece, sortOrder: 6 },
        { name: "Sel", quantity: 1, unit: IngredientUnit.tsp, sortOrder: 7 },
      ],
      instructions: [
        { stepNumber: 1, content: "Préchauffer le four à 200°C." },
        { stepNumber: 2, content: "Éplucher et couper les légumes en gros morceaux." },
        { stepNumber: 3, content: "Badigeonner le poulet d'huile d'olive, saler et poivrer." },
        { stepNumber: 4, content: "Disposer les légumes autour du poulet dans un plat allant au four." },
        { stepNumber: 5, content: "Ajouter le thym et l'ail." },
        { stepNumber: 6, content: "Enfourner 1h en arrosant régulièrement avec le jus de cuisson." },
      ],
    },
    {
      id: "seed-recipe-3",
      title: "Salade de quinoa méditerranéenne",
      description: "Une salade fraîche et nutritive aux saveurs méditerranéennes.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.easy,
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      calories: 320,
      protein: 12,
      carbs: 42,
      fat: 14,
      tagIds: ["seed-tag-healthy", "seed-tag-vegetarien", "seed-tag-batch"],
      ingredients: [
        { name: "Quinoa", quantity: 200, unit: IngredientUnit.g, sortOrder: 0 },
        { name: "Concombre", quantity: 1, unit: IngredientUnit.piece, sortOrder: 1 },
        { name: "Tomates cerises", quantity: 200, unit: IngredientUnit.g, sortOrder: 2 },
        { name: "Feta", quantity: 100, unit: IngredientUnit.g, sortOrder: 3 },
        { name: "Olives noires", quantity: 80, unit: IngredientUnit.g, sortOrder: 4 },
        { name: "Huile d'olive", quantity: 3, unit: IngredientUnit.tbsp, sortOrder: 5 },
        { name: "Jus de citron", quantity: 2, unit: IngredientUnit.tbsp, sortOrder: 6 },
        { name: "Menthe fraîche", quantity: 1, unit: IngredientUnit.tbsp, sortOrder: 7 },
      ],
      instructions: [
        { stepNumber: 1, content: "Rincer le quinoa et le cuire selon les instructions du paquet." },
        { stepNumber: 2, content: "Couper le concombre en dés et les tomates cerises en deux." },
        { stepNumber: 3, content: "Émietter la feta et couper les olives en rondelles." },
        { stepNumber: 4, content: "Mélanger le quinoa refroidi avec tous les légumes." },
        { stepNumber: 5, content: "Préparer la vinaigrette avec l'huile, le citron et la menthe." },
        { stepNumber: 6, content: "Assaisonner et servir frais." },
      ],
    },
    {
      id: "seed-recipe-4",
      title: "Spaghetti carbonara",
      description: "La vraie carbonara italienne avec guanciale et pecorino.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.medium,
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      calories: 520,
      protein: 22,
      carbs: 58,
      fat: 24,
      tagIds: ["seed-tag-rapide", "seed-tag-comfort"],
      ingredients: [
        { name: "Spaghetti", quantity: 400, unit: IngredientUnit.g, sortOrder: 0 },
        { name: "Guanciale", quantity: 200, unit: IngredientUnit.g, sortOrder: 1 },
        { name: "Jaunes d'oeufs", quantity: 4, unit: IngredientUnit.piece, sortOrder: 2 },
        { name: "Pecorino romano", quantity: 100, unit: IngredientUnit.g, sortOrder: 3 },
        { name: "Poivre noir", quantity: 1, unit: IngredientUnit.tsp, sortOrder: 4 },
      ],
      instructions: [
        { stepNumber: 1, content: "Cuire les spaghetti dans une grande casserole d'eau salée." },
        { stepNumber: 2, content: "Couper le guanciale en lardons et le faire rissoler à sec." },
        { stepNumber: 3, content: "Mélanger les jaunes d'oeufs avec le pecorino râpé et le poivre." },
        { stepNumber: 4, content: "Égoutter les pâtes en réservant un peu d'eau de cuisson." },
        { stepNumber: 5, content: "Hors du feu, mélanger les pâtes avec le guanciale puis le mélange d'oeufs." },
        { stepNumber: 6, content: "Ajuster la consistance avec l'eau de cuisson et servir aussitôt." },
      ],
    },
    {
      id: "seed-recipe-5",
      title: "Curry de lentilles aux épinards",
      description: "Un curry végétarien réconfortant, riche en protéines végétales.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.easy,
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      calories: 350,
      protein: 18,
      carbs: 48,
      fat: 10,
      tagIds: ["seed-tag-vegetarien", "seed-tag-healthy", "seed-tag-batch"],
      ingredients: [
        { name: "Lentilles corail", quantity: 300, unit: IngredientUnit.g, sortOrder: 0 },
        { name: "Épinards frais", quantity: 200, unit: IngredientUnit.g, sortOrder: 1 },
        { name: "Lait de coco", quantity: 400, unit: IngredientUnit.ml, sortOrder: 2 },
        { name: "Oignon", quantity: 1, unit: IngredientUnit.piece, sortOrder: 3 },
        { name: "Ail", quantity: 3, unit: IngredientUnit.piece, sortOrder: 4 },
        { name: "Pâte de curry", quantity: 2, unit: IngredientUnit.tbsp, sortOrder: 5 },
        { name: "Tomates concassées", quantity: 400, unit: IngredientUnit.g, sortOrder: 6 },
        { name: "Cumin", quantity: 1, unit: IngredientUnit.tsp, sortOrder: 7 },
      ],
      instructions: [
        { stepNumber: 1, content: "Rincer les lentilles et les égoutter." },
        { stepNumber: 2, content: "Faire revenir l'oignon et l'ail émincés dans un peu d'huile." },
        { stepNumber: 3, content: "Ajouter la pâte de curry et le cumin, cuire 1 minute." },
        { stepNumber: 4, content: "Ajouter les lentilles, les tomates et le lait de coco." },
        { stepNumber: 5, content: "Laisser mijoter 25 minutes jusqu'à ce que les lentilles soient tendres." },
        { stepNumber: 6, content: "Incorporer les épinards en fin de cuisson et servir avec du riz." },
      ],
    },
    {
      id: "seed-recipe-6",
      title: "Tacos au boeuf",
      description: "Des tacos épicés au boeuf haché avec garnitures fraîches.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.easy,
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      calories: 420,
      protein: 28,
      carbs: 35,
      fat: 18,
      tagIds: ["seed-tag-rapide", "seed-tag-proteine"],
      ingredients: [
        { name: "Boeuf haché", quantity: 500, unit: IngredientUnit.g, sortOrder: 0 },
        { name: "Tortillas", quantity: 8, unit: IngredientUnit.piece, sortOrder: 1 },
        { name: "Tomates", quantity: 2, unit: IngredientUnit.piece, sortOrder: 2 },
        { name: "Avocat", quantity: 1, unit: IngredientUnit.piece, sortOrder: 3 },
        { name: "Oignon rouge", quantity: 1, unit: IngredientUnit.piece, sortOrder: 4 },
        { name: "Coriandre", quantity: 1, unit: IngredientUnit.tbsp, sortOrder: 5 },
        { name: "Cumin", quantity: 1, unit: IngredientUnit.tsp, sortOrder: 6 },
        { name: "Citron vert", quantity: 1, unit: IngredientUnit.piece, sortOrder: 7 },
        { name: "Crème fraîche", quantity: 100, unit: IngredientUnit.ml, sortOrder: 8 },
      ],
      instructions: [
        { stepNumber: 1, content: "Faire revenir le boeuf haché avec le cumin et le paprika." },
        { stepNumber: 2, content: "Couper les tomates, l'avocat et l'oignon en petits dés." },
        { stepNumber: 3, content: "Réchauffer les tortillas à la poêle ou au four." },
        { stepNumber: 4, content: "Garnir chaque tortilla de viande et de légumes frais." },
        { stepNumber: 5, content: "Ajouter la crème, la coriandre et un filet de citron vert." },
      ],
    },
    {
      id: "seed-recipe-7",
      title: "Porridge aux fruits rouges",
      description: "Un porridge crémeux garni de fruits rouges de saison.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.easy,
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      calories: 310,
      protein: 10,
      carbs: 52,
      fat: 8,
      tagIds: ["seed-tag-rapide", "seed-tag-vegetarien", "seed-tag-healthy"],
      ingredients: [
        { name: "Flocons d'avoine", quantity: 100, unit: IngredientUnit.g, sortOrder: 0 },
        { name: "Lait", quantity: 300, unit: IngredientUnit.ml, sortOrder: 1 },
        { name: "Fruits rouges", quantity: 150, unit: IngredientUnit.g, sortOrder: 2 },
        { name: "Miel", quantity: 1, unit: IngredientUnit.tbsp, sortOrder: 3 },
        { name: "Graines de chia", quantity: 1, unit: IngredientUnit.tbsp, sortOrder: 4 },
      ],
      instructions: [
        { stepNumber: 1, content: "Verser les flocons d'avoine et le lait dans une casserole." },
        { stepNumber: 2, content: "Cuire à feu doux en remuant pendant 5-7 minutes." },
        { stepNumber: 3, content: "Verser dans des bols et garnir de fruits rouges." },
        { stepNumber: 4, content: "Ajouter le miel et les graines de chia." },
        { stepNumber: 5, content: "Servir immédiatement." },
      ],
    },
    {
      id: "seed-recipe-8",
      title: "Gratin dauphinois",
      description: "Le gratin dauphinois traditionnel, crémeux et fondant.",
      visibility: "public" as const,
      difficulty: RecipeDifficulty.medium,
      prepTime: 20,
      cookTime: 60,
      servings: 6,
      calories: 380,
      protein: 12,
      carbs: 35,
      fat: 22,
      tagIds: ["seed-tag-comfort", "seed-tag-vegetarien"],
      ingredients: [
        { name: "Pommes de terre", quantity: 1, unit: IngredientUnit.kg, sortOrder: 0 },
        { name: "Crème liquide", quantity: 400, unit: IngredientUnit.ml, sortOrder: 1 },
        { name: "Lait", quantity: 200, unit: IngredientUnit.ml, sortOrder: 2 },
        { name: "Ail", quantity: 2, unit: IngredientUnit.piece, sortOrder: 3 },
        { name: "Muscade", quantity: 1, unit: IngredientUnit.pinch, sortOrder: 4 },
        { name: "Beurre", quantity: 20, unit: IngredientUnit.g, sortOrder: 5 },
        { name: "Sel", quantity: 1, unit: IngredientUnit.tsp, sortOrder: 6 },
      ],
      instructions: [
        { stepNumber: 1, content: "Préchauffer le four à 180°C." },
        { stepNumber: 2, content: "Éplucher les pommes de terre et les couper en fines rondelles." },
        { stepNumber: 3, content: "Frotter un plat à gratin avec l'ail coupé en deux, puis le beurrer." },
        { stepNumber: 4, content: "Disposer les rondelles de pommes de terre en couches régulières." },
        { stepNumber: 5, content: "Mélanger la crème, le lait, le sel et la muscade, verser sur les pommes de terre." },
        { stepNumber: 6, content: "Enfourner 1h jusqu'à ce que le dessus soit bien doré." },
      ],
    },
  ];

  for (const recipe of seedRecipes) {
    const { tagIds, ingredients, instructions, ...recipeData } = recipe;
    await prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {},
      create: {
        ...recipeData,
        userId: user.id,
        ingredients: {
          create: ingredients,
        },
        instructions: {
          create: instructions,
        },
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
  }
  console.log(`Seeded ${seedRecipes.length} recipes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

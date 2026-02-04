import { PrismaClient, HabitFrequency } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

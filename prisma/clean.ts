import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning database...");

  // Delete in reverse order of dependencies
  await prisma.notification.deleteMany({});
  await prisma.checkpoint.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.workoutSession.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.workout.deleteMany({});
  await prisma.clientProfile.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Database cleaned!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function createUserDirectly(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "TRAINER" | "CLIENT",
  phone?: string
) {
  const hashedPassword = await hashPassword(password);

  // Create user directly in database (Better-Auth style)
  // Note: accountId should match userId for credential provider
  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role,
      phone,
      emailVerified: true,
    },
  });

  // Create account separately to use user.id as accountId (Better-Auth convention)
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  return user;
}

async function main() {
  console.log("🌱 Initializing database seed...");

  // Create trainer
  console.log("Creating trainer...");
  const trainer = await createUserDirectly(
    "trainer@ptcrm.com",
    "password123",
    "Marco",
    "Fitness",
    "TRAINER",
    "+39 333 1234567"
  );
  console.log("✅ Trainer created:", trainer.email);

  // Create test clients
  console.log("Creating client1...");
  const client1 = await createUserDirectly(
    "mario.rossi@email.com",
    "password123",
    "Mario",
    "Rossi",
    "CLIENT",
    "+39 333 1111111"
  );

  // Create client profile for client1
  await prisma.clientProfile.create({
    data: {
      userId: client1.id,
      goals: "Perdita peso e tonificazione",
      notes: "Cliente motivato, principiante",
      startDate: new Date(),
      cardExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log("Creating client2...");
  const client2 = await createUserDirectly(
    "laura.bianchi@email.com",
    "password123",
    "Laura",
    "Bianchi",
    "CLIENT",
    "+39 333 2222222"
  );

  // Create client profile for client2
  await prisma.clientProfile.create({
    data: {
      userId: client2.id,
      goals: "Incremento massa muscolare",
      notes: "Esperienza media, costante",
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      cardExpiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
    },
  });

  console.log("Creating client3...");
  const client3 = await createUserDirectly(
    "giuseppe.verdi@email.com",
    "password123",
    "Giuseppe",
    "Verdi",
    "CLIENT",
    "+39 333 3333333"
  );

  // Create client profile for client3
  await prisma.clientProfile.create({
    data: {
      userId: client3.id,
      goals: "Miglioramento fitness generale",
      notes: "Discontinuo, necessita motivazione",
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      cardExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log("✅ Clients created:");
  console.log("  -", client1.email);
  console.log("  -", client2.email);
  console.log("  -", client3.email);

  // Create workout program for client1
  const clientProfile1 = await prisma.clientProfile.findUnique({
    where: { userId: client1.id },
  });

  if (clientProfile1) {
    const workout1 = await prisma.workout.create({
      data: {
        clientId: clientProfile1.id,
        name: "Scheda Full Body A",
        description: "Programma per principianti - 3 volte a settimana",
        isActive: true,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        exercises: {
          create: [
            {
              name: "Squat",
              sets: 3,
              reps: "12-15",
              weight: "Bodyweight",
              rest: "90s",
              order: 1,
              notes: "Keep your back straight",
            },
            {
              name: "Bench Press",
              sets: 3,
              reps: "10-12",
              weight: "20kg",
              rest: "90s",
              order: 2,
            },
            {
              name: "Lat Pulldown",
              sets: 3,
              reps: "12",
              weight: "30kg",
              rest: "60s",
              order: 3,
            },
            {
              name: "Military Press",
              sets: 3,
              reps: "10",
              weight: "15kg",
              rest: "90s",
              order: 4,
            },
            {
              name: "Barbell Curl",
              sets: 3,
              reps: "12",
              weight: "10kg",
              rest: "60s",
              order: 5,
            },
            {
              name: "French Press",
              sets: 3,
              reps: "12",
              weight: "8kg",
              rest: "60s",
              order: 6,
            },
            {
              name: "Crunch",
              sets: 3,
              reps: "15-20",
              weight: "Bodyweight",
              rest: "45s",
              order: 7,
            },
            {
              name: "Plank",
              sets: 3,
              reps: "30-45s",
              weight: "Bodyweight",
              rest: "60s",
              order: 8,
            },
          ],
        },
      },
    });

    console.log("✅ Workout program created for", client1.email);

    // Create workout sessions
    await prisma.workoutSession.create({
      data: {
        clientId: client1.id,
        workoutId: workout1.id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 45,
        completed: true,
        rating: 5,
        feedback: "Great workout, I feel really good!",
      },
    });

    await prisma.workoutSession.create({
      data: {
        clientId: client1.id,
        workoutId: workout1.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 50,
        completed: true,
        rating: 4,
      },
    });

    console.log("✅ Workout sessions created");
  }

  // Create measurements for client1
  await prisma.measurement.create({
    data: {
      clientId: client1.id,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      weight: 78,
      chest: 95,
      shoulders: 110,
      waist: 85,
      hips: 98,
      bicepRelaxed: 32,
      bicepContracted: 35,
      quadRelaxed: 56,
      quadContracted: 60,
      calfContracted: 38,
      bodyFatPercentage: 18,
    },
  });

  await prisma.measurement.create({
    data: {
      clientId: client1.id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      weight: 76.5,
      chest: 94,
      shoulders: 111,
      waist: 83,
      hips: 97,
      bicepRelaxed: 32.5,
      bicepContracted: 35.5,
      quadRelaxed: 55.5,
      quadContracted: 59.5,
      calfContracted: 38.5,
      bodyFatPercentage: 16.5,
    },
  });

  console.log("✅ Measurements created");

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: trainer.id,
      type: "WORKOUT_COMPLETED",
      message: "Mario Rossi completed a workout",
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: client1.id,
      type: "WORKOUT_REMINDER",
      message: "You have an appointment tomorrow at 15:00",
      read: false,
    },
  });

  console.log("✅ Notifications created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("\nTrainer:");
  console.log("  Email: trainer@ptcrm.com");
  console.log("  Password: password123");
  console.log("\nClients:");
  console.log("  Email: mario.rossi@email.com");
  console.log("  Email: laura.bianchi@email.com");
  console.log("  Email: giuseppe.verdi@email.com");
  console.log("  Password (all): password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

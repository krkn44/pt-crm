import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inizializzazione seed database...");

  // Hash password per gli utenti di test
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Crea un trainer
  const trainer = await prisma.user.upsert({
    where: { email: "trainer@ptcrm.com" },
    update: {},
    create: {
      email: "trainer@ptcrm.com",
      password: hashedPassword,
      nome: "Marco",
      cognome: "Fitness",
      role: "TRAINER",
      telefono: "+39 333 1234567",
    },
  });

  console.log("✅ Trainer creato:", trainer.email);

  // Crea clienti di test
  const client1 = await prisma.user.upsert({
    where: { email: "mario.rossi@email.com" },
    update: {},
    create: {
      email: "mario.rossi@email.com",
      password: hashedPassword,
      nome: "Mario",
      cognome: "Rossi",
      role: "CLIENT",
      telefono: "+39 333 1111111",
      clientProfile: {
        create: {
          obiettivi: "Perdita peso e tonificazione",
          note: "Cliente motivato, principiante",
          dataInizio: new Date(),
          scadenzaScheda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
        },
      },
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "laura.bianchi@email.com" },
    update: {},
    create: {
      email: "laura.bianchi@email.com",
      password: hashedPassword,
      nome: "Laura",
      cognome: "Bianchi",
      role: "CLIENT",
      telefono: "+39 333 2222222",
      clientProfile: {
        create: {
          obiettivi: "Incremento massa muscolare",
          note: "Esperienza media, costante",
          dataInizio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 giorni fa
          scadenzaScheda: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 giorni
        },
      },
    },
  });

  const client3 = await prisma.user.upsert({
    where: { email: "giuseppe.verdi@email.com" },
    update: {},
    create: {
      email: "giuseppe.verdi@email.com",
      password: hashedPassword,
      nome: "Giuseppe",
      cognome: "Verdi",
      role: "CLIENT",
      telefono: "+39 333 3333333",
      clientProfile: {
        create: {
          obiettivi: "Miglioramento fitness generale",
          note: "Discontinuo, necessita motivazione",
          dataInizio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 giorni fa
          scadenzaScheda: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
        },
      },
    },
  });

  console.log("✅ Clienti creati:");
  console.log("  -", client1.email);
  console.log("  -", client2.email);
  console.log("  -", client3.email);

  // Crea una scheda di allenamento per client1
  const clientProfile1 = await prisma.clientProfile.findUnique({
    where: { userId: client1.id },
  });

  if (clientProfile1) {
    const workout1 = await prisma.workout.create({
      data: {
        clientId: clientProfile1.id,
        nome: "Scheda Full Body A",
        descrizione: "Programma per principianti - 3 volte a settimana",
        isActive: true,
        dataScadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        exercises: {
          create: [
            {
              nome: "Squat",
              serie: 3,
              ripetizioni: "12-15",
              peso: "Corpo libero",
              recupero: "90s",
              ordine: 1,
              note: "Mantenere la schiena dritta",
            },
            {
              nome: "Panca piana",
              serie: 3,
              ripetizioni: "10-12",
              peso: "20kg",
              recupero: "90s",
              ordine: 2,
            },
            {
              nome: "Lat machine",
              serie: 3,
              ripetizioni: "12",
              peso: "30kg",
              recupero: "60s",
              ordine: 3,
            },
            {
              nome: "Military press",
              serie: 3,
              ripetizioni: "10",
              peso: "15kg",
              recupero: "90s",
              ordine: 4,
            },
            {
              nome: "Curl bilanciere",
              serie: 3,
              ripetizioni: "12",
              peso: "10kg",
              recupero: "60s",
              ordine: 5,
            },
            {
              nome: "French press",
              serie: 3,
              ripetizioni: "12",
              peso: "8kg",
              recupero: "60s",
              ordine: 6,
            },
            {
              nome: "Crunch",
              serie: 3,
              ripetizioni: "15-20",
              peso: "Corpo libero",
              recupero: "45s",
              ordine: 7,
            },
            {
              nome: "Plank",
              serie: 3,
              ripetizioni: "30-45s",
              peso: "Corpo libero",
              recupero: "60s",
              ordine: 8,
            },
          ],
        },
      },
    });

    console.log("✅ Scheda allenamento creata per", client1.email);

    // Crea alcune sessioni di allenamento
    await prisma.workoutSession.create({
      data: {
        clientId: client1.id,
        workoutId: workout1.id,
        data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        durata: 45,
        completato: true,
        rating: 5,
        feedback: "Ottimo allenamento, mi sento molto bene!",
      },
    });

    await prisma.workoutSession.create({
      data: {
        clientId: client1.id,
        workoutId: workout1.id,
        data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        durata: 50,
        completato: true,
        rating: 4,
      },
    });

    console.log("✅ Sessioni allenamento create");
  }

  // Crea misurazioni per client1
  await prisma.measurement.create({
    data: {
      clientId: client1.id,
      data: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      peso: 78,
      altezza: 175,
      petto: 95,
      vita: 85,
      fianchi: 98,
      braccioSx: 32,
      braccioDx: 32,
      gambaSx: 56,
      gambaDx: 56,
      percentualeGrasso: 18,
    },
  });

  await prisma.measurement.create({
    data: {
      clientId: client1.id,
      data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      peso: 76.5,
      altezza: 175,
      petto: 94,
      vita: 83,
      fianchi: 97,
      braccioSx: 32.5,
      braccioDx: 32.5,
      gambaSx: 55.5,
      gambaDx: 55.5,
      percentualeGrasso: 16.5,
    },
  });

  console.log("✅ Misurazioni create");

  // Crea notifiche
  await prisma.notification.create({
    data: {
      userId: trainer.id,
      tipo: "WORKOUT_COMPLETED",
      messaggio: "Mario Rossi ha completato un allenamento",
      letto: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: client1.id,
      tipo: "APPOINTMENT_REMINDER",
      messaggio: "Hai un appuntamento domani alle 15:00",
      letto: false,
    },
  });

  console.log("✅ Notifiche create");

  console.log("\n🎉 Seed completato con successo!");
  console.log("\n📝 Credenziali di accesso:");
  console.log("\nTrainer:");
  console.log("  Email: trainer@ptcrm.com");
  console.log("  Password: password123");
  console.log("\nClienti:");
  console.log("  Email: mario.rossi@email.com");
  console.log("  Email: laura.bianchi@email.com");
  console.log("  Email: giuseppe.verdi@email.com");
  console.log("  Password (tutti): password123");
}

main()
  .catch((e) => {
    console.error("❌ Errore durante il seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

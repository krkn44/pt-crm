import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, workoutId, exerciseData, rating, feedback, completato } =
      body;

    // Verifica che il clientId corrisponda all'utente loggato
    if (clientId !== session.user.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Crea la sessione di allenamento
    const workoutSession = await prisma.workoutSession.create({
      data: {
        clientId,
        workoutId,
        data: new Date(),
        completato,
        rating,
        feedback,
        exerciseData: exerciseData || [],
      },
    });

    // Crea notifica per il trainer
    // Trova il trainer (in questo caso assumiamo ci sia un solo trainer)
    const trainer = await prisma.user.findFirst({
      where: { role: "TRAINER" },
    });

    if (trainer) {
      await prisma.notification.create({
        data: {
          userId: trainer.id,
          tipo: "WORKOUT_COMPLETED",
          messaggio: `${session.user.nome} ${session.user.cognome} ha completato un allenamento`,
          letto: false,
        },
      });
    }

    return NextResponse.json(workoutSession);
  } catch (error) {
    console.error("Errore nel creare la sessione:", error);
    return NextResponse.json(
      { error: "Errore nel creare la sessione" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId richiesto" },
        { status: 400 }
      );
    }

    // Verifica autorizzazioni: trainer può vedere tutti, cliente solo i propri
    if (session.user.role === "CLIENT" && clientId !== session.user.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const sessions = await prisma.workoutSession.findMany({
      where: { clientId },
      include: {
        workout: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data: "desc",
      },
      take: 50,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Errore nel recuperare le sessioni:", error);
    return NextResponse.json(
      { error: "Errore nel recuperare le sessioni" },
      { status: 500 }
    );
  }
}

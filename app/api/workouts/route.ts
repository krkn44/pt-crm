import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/workouts?clientId=xxx - Recupera schede di un cliente
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

    // Trova il client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: clientId },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Profilo cliente non trovato" },
        { status: 404 }
      );
    }

    const workouts = await prisma.workout.findMany({
      where: {
        clientId: clientProfile.id,
      },
      include: {
        exercises: {
          orderBy: {
            ordine: "asc",
          },
        },
        _count: {
          select: {
            workoutSessions: true,
          },
        },
      },
      orderBy: {
        dataCreazione: "desc",
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Errore nel recuperare le schede:", error);
    return NextResponse.json(
      { error: "Errore nel recuperare le schede" },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Crea una nuova scheda (solo trainer)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      nome,
      descrizione,
      dataScadenza,
      exercises,
      setAsActive,
    } = body;

    if (!clientId || !nome || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "clientId, nome ed esercizi sono obbligatori" },
        { status: 400 }
      );
    }

    // Trova il client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: clientId },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Profilo cliente non trovato" },
        { status: 404 }
      );
    }

    // Se setAsActive è true, disattiva tutte le altre schede
    if (setAsActive) {
      await prisma.workout.updateMany({
        where: {
          clientId: clientProfile.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Crea la nuova scheda con esercizi
    const workout = await prisma.workout.create({
      data: {
        clientId: clientProfile.id,
        nome,
        descrizione,
        dataScadenza: dataScadenza ? new Date(dataScadenza) : null,
        isActive: setAsActive || false,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            nome: ex.nome,
            serie: ex.serie,
            ripetizioni: ex.ripetizioni,
            peso: ex.peso,
            recupero: ex.recupero,
            note: ex.note,
            videoUrl: ex.videoUrl,
            ordine: index + 1,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: {
            ordine: "asc",
          },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Errore nella creazione della scheda:", error);
    return NextResponse.json(
      { error: "Errore nella creazione della scheda" },
      { status: 500 }
    );
  }
}

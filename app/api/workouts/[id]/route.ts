import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const workoutId = params.id;
    const body = await request.json();
    const { nome, descrizione, dataScadenza, isActive, exercises } = body;

    // Se isActive è true, disattiva tutte le altre schede dello stesso cliente
    if (isActive) {
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
      });

      if (workout) {
        await prisma.workout.updateMany({
          where: {
            clientId: workout.clientId,
            isActive: true,
            id: { not: workoutId },
          },
          data: {
            isActive: false,
          },
        });
      }
    }

    // Se sono forniti esercizi, elimina i vecchi e crea i nuovi
    if (exercises) {
      // Elimina esercizi esistenti
      await prisma.exercise.deleteMany({
        where: { workoutId },
      });

      // Aggiorna workout e crea nuovi esercizi
      const updatedWorkout = await prisma.workout.update({
        where: { id: workoutId },
        data: {
          nome,
          descrizione,
          dataScadenza: dataScadenza ? new Date(dataScadenza) : null,
          isActive,
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

      return NextResponse.json(updatedWorkout);
    } else {
      // Aggiorna solo i dati della scheda
      const updatedWorkout = await prisma.workout.update({
        where: { id: workoutId },
        data: {
          nome,
          descrizione,
          dataScadenza: dataScadenza ? new Date(dataScadenza) : null,
          isActive,
        },
        include: {
          exercises: {
            orderBy: {
              ordine: "asc",
            },
          },
        },
      });

      return NextResponse.json(updatedWorkout);
    }
  } catch (error) {
    console.error("Errore nell'aggiornare la scheda:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornare la scheda" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const workoutId = params.id;

    await prisma.workout.delete({
      where: { id: workoutId },
    });

    return NextResponse.json({ message: "Scheda eliminata con successo" });
  } catch (error) {
    console.error("Errore nell'eliminare la scheda:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminare la scheda" },
      { status: 500 }
    );
  }
}

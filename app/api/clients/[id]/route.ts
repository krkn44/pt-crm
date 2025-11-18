import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const clientId = params.id;

    // I clienti possono vedere solo i propri dati
    if (
      session.user.role === "CLIENT" &&
      session.user.id !== clientId
    ) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const client = await prisma.user.findUnique({
      where: {
        id: clientId,
        role: "CLIENT",
      },
      include: {
        clientProfile: {
          include: {
            workouts: {
              include: {
                exercises: {
                  orderBy: {
                    ordine: "asc",
                  },
                },
              },
            },
          },
        },
        workoutSessions: {
          include: {
            workout: true,
          },
          orderBy: {
            data: "desc",
          },
        },
        measurements: {
          orderBy: {
            data: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    // Rimuovi password dalla risposta
    const { password: _, ...clientWithoutPassword } = client;

    return NextResponse.json(clientWithoutPassword);
  } catch (error) {
    console.error("Errore nel recuperare il cliente:", error);
    return NextResponse.json(
      { error: "Errore nel recuperare il cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Solo i trainer possono modificare i dati dei clienti
    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const clientId = params.id;
    const body = await request.json();
    const { nome, cognome, telefono, obiettivi, note, scadenzaScheda } = body;

    const updatedClient = await prisma.user.update({
      where: {
        id: clientId,
      },
      data: {
        nome,
        cognome,
        telefono,
        clientProfile: {
          update: {
            obiettivi,
            note,
            scadenzaScheda: scadenzaScheda ? new Date(scadenzaScheda) : undefined,
          },
        },
      },
      include: {
        clientProfile: true,
      },
    });

    const { password: _, ...clientWithoutPassword } = updatedClient;

    return NextResponse.json(clientWithoutPassword);
  } catch (error) {
    console.error("Errore nell'aggiornare il cliente:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornare il cliente" },
      { status: 500 }
    );
  }
}

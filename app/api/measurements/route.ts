import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/measurements?clientId=xxx
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

    // Verifica autorizzazioni
    if (session.user.role === "CLIENT" && clientId !== session.user.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const measurements = await prisma.measurement.findMany({
      where: { clientId },
      orderBy: { data: "desc" },
    });

    return NextResponse.json(measurements);
  } catch (error) {
    console.error("Errore nel recuperare le misurazioni:", error);
    return NextResponse.json(
      { error: "Errore nel recuperare le misurazioni" },
      { status: 500 }
    );
  }
}

// POST /api/measurements
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientId,
      data,
      peso,
      altezza,
      petto,
      vita,
      fianchi,
      braccioSx,
      braccioDx,
      gambaSx,
      gambaDx,
      percentualeGrasso,
      note,
    } = body;

    // I clienti possono inserire solo le proprie misurazioni
    if (session.user.role === "CLIENT" && clientId !== session.user.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const measurement = await prisma.measurement.create({
      data: {
        clientId,
        data: data ? new Date(data) : new Date(), // Usa la data specificata o quella odierna
        peso: peso ? parseFloat(peso) : null,
        altezza: altezza ? parseFloat(altezza) : null,
        petto: petto ? parseFloat(petto) : null,
        vita: vita ? parseFloat(vita) : null,
        fianchi: fianchi ? parseFloat(fianchi) : null,
        braccioSx: braccioSx ? parseFloat(braccioSx) : null,
        braccioDx: braccioDx ? parseFloat(braccioDx) : null,
        gambaSx: gambaSx ? parseFloat(gambaSx) : null,
        gambaDx: gambaDx ? parseFloat(gambaDx) : null,
        percentualeGrasso: percentualeGrasso
          ? parseFloat(percentualeGrasso)
          : null,
        note,
      },
    });

    // Crea notifica per il trainer
    const trainer = await prisma.user.findFirst({
      where: { role: "TRAINER" },
    });

    if (trainer) {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
      });

      if (client) {
        await prisma.notification.create({
          data: {
            userId: trainer.id,
            tipo: "MEASUREMENT_ADDED",
            messaggio: `${client.nome} ${client.cognome} ha aggiunto una nuova misurazione`,
            letto: false,
          },
        });
      }
    }

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    console.error("Errore nella creazione della misurazione:", error);
    return NextResponse.json(
      { error: "Errore nella creazione della misurazione" },
      { status: 500 }
    );
  }
}

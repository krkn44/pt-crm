import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/clients - Recupera tutti i clienti (solo trainer)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Solo i trainer possono vedere la lista clienti
    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      include: {
        clientProfile: true,
        workoutSessions: {
          orderBy: {
            data: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            workoutSessions: true,
            measurements: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Errore nel recuperare i clienti:", error);
    return NextResponse.json(
      { error: "Errore nel recuperare i clienti" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Crea un nuovo cliente (solo trainer)
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
    const { email, password, nome, cognome, telefono, obiettivi, note } = body;

    // Validazione base
    if (!email || !password || !nome || !cognome) {
      return NextResponse.json(
        { error: "Email, password, nome e cognome sono obbligatori" },
        { status: 400 }
      );
    }

    // Verifica se l'email esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già esistente" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea utente con profilo cliente
    const client = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nome,
        cognome,
        telefono,
        role: "CLIENT",
        clientProfile: {
          create: {
            obiettivi,
            note,
          },
        },
      },
      include: {
        clientProfile: true,
      },
    });

    // Rimuovi password dalla risposta
    const { password: _, ...clientWithoutPassword } = client;

    return NextResponse.json(clientWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Errore nella creazione del cliente:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del cliente" },
      { status: 500 }
    );
  }
}

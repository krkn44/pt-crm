import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await params;

    // Clients can only view their own data
    if (
      session.user.role === "CLIENT" &&
      session.user.id !== clientId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
                    order: "asc",
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
            date: "desc",
          },
        },
        measurements: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...clientWithoutPassword } = client;

    return NextResponse.json(clientWithoutPassword);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Error fetching client" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only trainers can modify client data
    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: clientId } = await params;
    const body = await request.json();
    const { firstName, lastName, phone, goals, notes, cardExpiryDate } = body;

    const updatedClient = await prisma.user.update({
      where: {
        id: clientId,
      },
      data: {
        firstName,
        lastName,
        phone,
        clientProfile: {
          update: {
            goals,
            notes,
            cardExpiryDate: cardExpiryDate ? new Date(cardExpiryDate) : undefined,
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
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Error updating client" },
      { status: 500 }
    );
  }
}

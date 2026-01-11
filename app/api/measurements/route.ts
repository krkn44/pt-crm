import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";

// GET /api/measurements?clientId=xxx
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId required" },
        { status: 400 }
      );
    }

    // Authorization check
    if (session.user.role === "CLIENT" && clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const measurements = await prisma.measurement.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(measurements);
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return NextResponse.json(
      { error: "Error fetching measurements" },
      { status: 500 }
    );
  }
}

// POST /api/measurements
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientId,
      date,
      weight,
      chest,
      shoulders,
      waist,
      hips,
      bicepRelaxed,
      bicepContracted,
      quadRelaxed,
      quadContracted,
      calfContracted,
      bodyFatPercentage,
      notes,
    } = body;

    // Clients can only insert their own measurements
    if (session.user.role === "CLIENT" && clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const measurement = await prisma.measurement.create({
      data: {
        clientId,
        date: date ? new Date(date) : new Date(), // Use specified date or today's date
        weight: weight ? parseFloat(weight) : null,
        chest: chest ? parseFloat(chest) : null,
        shoulders: shoulders ? parseFloat(shoulders) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        bicepRelaxed: bicepRelaxed ? parseFloat(bicepRelaxed) : null,
        bicepContracted: bicepContracted ? parseFloat(bicepContracted) : null,
        quadRelaxed: quadRelaxed ? parseFloat(quadRelaxed) : null,
        quadContracted: quadContracted ? parseFloat(quadContracted) : null,
        calfContracted: calfContracted ? parseFloat(calfContracted) : null,
        bodyFatPercentage: bodyFatPercentage
          ? parseFloat(bodyFatPercentage)
          : null,
        notes,
      },
    });

    // Create notification for the trainer
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
            type: "MEASUREMENT_ADDED",
            message: `${client.firstName} ${client.lastName} added a new measurement`,
            read: false,
          },
        });
      }
    }

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    console.error("Error creating measurement:", error);
    return NextResponse.json(
      { error: "Error creating measurement" },
      { status: 500 }
    );
  }
}

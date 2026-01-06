import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";

// GET /api/measurements/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const measurement = await prisma.measurement.findUnique({
      where: { id },
    });

    if (!measurement) {
      return NextResponse.json(
        { error: "Measurement not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (
      session.user.role === "CLIENT" &&
      measurement.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(measurement);
  } catch (error) {
    console.error("Error fetching measurement:", error);
    return NextResponse.json(
      { error: "Error fetching measurement" },
      { status: 500 }
    );
  }
}

// PUT /api/measurements/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const measurement = await prisma.measurement.findUnique({
      where: { id },
    });

    if (!measurement) {
      return NextResponse.json(
        { error: "Measurement not found" },
        { status: 404 }
      );
    }

    // Authorization check - clients can only edit their own measurements
    if (
      session.user.role === "CLIENT" &&
      measurement.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
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

    const updatedMeasurement = await prisma.measurement.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : undefined,
        chest: chest !== undefined ? (chest ? parseFloat(chest) : null) : undefined,
        shoulders: shoulders !== undefined ? (shoulders ? parseFloat(shoulders) : null) : undefined,
        waist: waist !== undefined ? (waist ? parseFloat(waist) : null) : undefined,
        hips: hips !== undefined ? (hips ? parseFloat(hips) : null) : undefined,
        bicepRelaxed: bicepRelaxed !== undefined ? (bicepRelaxed ? parseFloat(bicepRelaxed) : null) : undefined,
        bicepContracted: bicepContracted !== undefined ? (bicepContracted ? parseFloat(bicepContracted) : null) : undefined,
        quadRelaxed: quadRelaxed !== undefined ? (quadRelaxed ? parseFloat(quadRelaxed) : null) : undefined,
        quadContracted: quadContracted !== undefined ? (quadContracted ? parseFloat(quadContracted) : null) : undefined,
        calfContracted: calfContracted !== undefined ? (calfContracted ? parseFloat(calfContracted) : null) : undefined,
        bodyFatPercentage: bodyFatPercentage !== undefined ? (bodyFatPercentage ? parseFloat(bodyFatPercentage) : null) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(updatedMeasurement);
  } catch (error) {
    console.error("Error updating measurement:", error);
    return NextResponse.json(
      { error: "Error updating measurement" },
      { status: 500 }
    );
  }
}

// DELETE /api/measurements/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const measurement = await prisma.measurement.findUnique({
      where: { id },
    });

    if (!measurement) {
      return NextResponse.json(
        { error: "Measurement not found" },
        { status: 404 }
      );
    }

    // Authorization check - clients can only delete their own measurements
    if (
      session.user.role === "CLIENT" &&
      measurement.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.measurement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting measurement:", error);
    return NextResponse.json(
      { error: "Error deleting measurement" },
      { status: 500 }
    );
  }
}

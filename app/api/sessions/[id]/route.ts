import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/sessions/[id] - Get single session with all details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workout: {
          include: {
            exercises: {
              orderBy: { order: "asc" },
            },
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Authorization check: trainer can see all, client can only see their own
    if (
      session.user.role === "CLIENT" &&
      workoutSession.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(workoutSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Error fetching session" },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update session feedback and rating
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { feedback, rating, exerciseData } = body;

    // Get existing session to verify ownership
    const existingSession = await prisma.workoutSession.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Only the owner client can modify their own session
    if (existingSession.clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prepare update data
    const updateData: {
      feedback?: string;
      rating?: number;
      exerciseData?: Prisma.InputJsonValue;
    } = {};

    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating;
    if (exerciseData !== undefined) updateData.exerciseData = exerciseData;

    const updatedSession = await prisma.workoutSession.update({
      where: { id },
      data: updateData,
      include: {
        workout: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Error updating session" },
      { status: 500 }
    );
  }
}

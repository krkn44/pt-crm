import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, workoutId, exerciseData, rating, feedback, completed } =
      body;

    // Verify that clientId matches the logged in user
    if (clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the workout session
    const workoutSession = await prisma.workoutSession.create({
      data: {
        clientId,
        workoutId,
        date: new Date(),
        completed,
        rating,
        feedback,
        exerciseData: exerciseData || [],
      },
    });

    // Create notification for the trainer
    // Assuming there is only one trainer
    const trainer = await prisma.user.findFirst({
      where: { role: "TRAINER" },
    });

    if (trainer) {
      await prisma.notification.create({
        data: {
          userId: trainer.id,
          type: "WORKOUT_COMPLETED",
          message: `${session.user.firstName} ${session.user.lastName} completed a workout`,
          read: false,
        },
      });
    }

    return NextResponse.json(workoutSession);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Error creating session" },
      { status: 500 }
    );
  }
}

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

    // Authorization check: trainer can see all, client can only see their own
    if (session.user.role === "CLIENT" && clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sessions = await prisma.workoutSession.findMany({
      where: { clientId },
      include: {
        workout: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 50,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Error fetching sessions" },
      { status: 500 }
    );
  }
}

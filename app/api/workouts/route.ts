import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";

// GET /api/workouts?clientId=xxx - Get workouts for a client
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

    // Find the client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: clientId },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client profile not found" },
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
            order: "asc",
          },
        },
        _count: {
          select: {
            workoutSessions: true,
          },
        },
      },
      orderBy: {
        createdDate: "desc",
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Error fetching workouts" },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Create a new workout (trainer only)
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      name,
      description,
      expiryDate,
      exercises,
      setAsActive,
    } = body;

    if (!clientId || !name || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "clientId, name and exercises are required" },
        { status: 400 }
      );
    }

    // Find or create the client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: clientId },
    });

    if (!clientProfile) {
      // Verify the user exists and is a CLIENT
      const user = await prisma.user.findUnique({
        where: { id: clientId, role: "CLIENT" },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }

      // Create the client profile automatically
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId: clientId,
        },
      });
    }

    // If setAsActive is true, deactivate all other workouts
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

    // Create the new workout with exercises
    const workout = await prisma.workout.create({
      data: {
        clientId: clientProfile.id,
        name,
        description,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: setAsActive || false,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest: ex.rest,
            notes: ex.notes,
            videoUrl: ex.videoUrl,
            order: index + 1,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Error creating workout" },
      { status: 500 }
    );
  }
}

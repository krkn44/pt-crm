import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: workoutId } = await params;
    const body = await request.json();
    const { name, description, expiryDate, isActive, exercises } = body;

    // If isActive is true, deactivate all other workouts for the same client
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

    // If exercises are provided, delete old ones and create new ones
    if (exercises) {
      // Delete existing exercises
      await prisma.exercise.deleteMany({
        where: { workoutId },
      });

      // Update workout and create new exercises
      const updatedWorkout = await prisma.workout.update({
        where: { id: workoutId },
        data: {
          name,
          description,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          isActive,
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

      return NextResponse.json(updatedWorkout);
    } else {
      // Update only workout data
      const updatedWorkout = await prisma.workout.update({
        where: { id: workoutId },
        data: {
          name,
          description,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          isActive,
        },
        include: {
          exercises: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return NextResponse.json(updatedWorkout);
    }
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "Error updating workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: workoutId } = await params;

    await prisma.workout.delete({
      where: { id: workoutId },
    });

    return NextResponse.json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json(
      { error: "Error deleting workout" },
      { status: 500 }
    );
  }
}

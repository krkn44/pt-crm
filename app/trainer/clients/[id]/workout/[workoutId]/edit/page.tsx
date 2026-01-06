import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { WorkoutEditor } from "@/components/workout/WorkoutEditor";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string; workoutId: string }>;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const { id, workoutId } = await params;
  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Fetch client with profile
  const client = await prisma.user.findUnique({
    where: {
      id,
      role: "CLIENT",
    },
    include: {
      clientProfile: true,
    },
  });

  if (!client || !client.clientProfile) {
    return notFound();
  }

  // Fetch workout to edit
  const workout = await prisma.workout.findUnique({
    where: {
      id: workoutId,
    },
    include: {
      exercises: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!workout || workout.clientId !== client.clientProfile.id) {
    return notFound();
  }

  // Prepare data for WorkoutEditor
  const initialData = {
    id: workout.id,
    name: workout.name,
    description: workout.description || "",
    expiryDate: workout.expiryDate
      ? format(workout.expiryDate, "yyyy-MM-dd")
      : "",
    exercises: workout.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight || "",
      rest: ex.rest || "",
      notes: ex.notes || "",
      videoUrl: ex.videoUrl || "",
    })),
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Edit Workout" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Edit Workout for {client.firstName} {client.lastName}
            </h2>
            <p className="text-muted-foreground">
              Update exercises and workout information
            </p>
          </div>

          <WorkoutEditor clientId={id} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}

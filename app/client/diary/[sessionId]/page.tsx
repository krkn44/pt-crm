import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { notFound } from "next/navigation";
import { SessionDetail } from "./SessionDetail";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const { sessionId } = await params;
  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Fetch session with all details
  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      workout: {
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!workoutSession) {
    notFound();
  }

  // Verify that user owns this session
  if (workoutSession.clientId !== session.user.id) {
    notFound();
  }

  // Serialize data for client component
  const serializedSession = {
    id: workoutSession.id,
    date: workoutSession.date.toISOString(),
    duration: workoutSession.duration,
    feedback: workoutSession.feedback,
    rating: workoutSession.rating,
    completed: workoutSession.completed,
    exerciseData: workoutSession.exerciseData as Array<{
      exerciseId: string;
      sets: Array<{
        reps: number;
        weight: string;
      }>;
      note?: string;
    }> | null,
    workout: {
      name: workoutSession.workout.name,
      description: workoutSession.workout.description,
      exercises: workoutSession.workout.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest: ex.rest,
        notes: ex.notes,
        order: ex.order,
      })),
    },
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Session Detail" />

      <div className="flex-1 p-6">
        <SessionDetail session={serializedSession} />
      </div>
    </div>
  );
}

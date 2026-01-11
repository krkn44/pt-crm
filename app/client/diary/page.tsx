import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { DiaryContent } from "./DiaryContent";

export default async function DiaryPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Fetch all workout sessions for the client
  const workoutSessions = await prisma.workoutSession.findMany({
    where: { clientId: session.user.id },
    orderBy: { date: "desc" },
    include: {
      workout: {
        select: {
          name: true,
        },
      },
    },
  });

  // Serialize dates for client component
  const serializedSessions = workoutSessions.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    workoutName: s.workout.name,
    rating: s.rating,
    feedback: s.feedback,
    duration: s.duration,
    completed: s.completed,
  }));

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Workout Diary" />

      <div className="flex-1 p-6">
        <DiaryContent sessions={serializedSessions} />
      </div>
    </div>
  );
}

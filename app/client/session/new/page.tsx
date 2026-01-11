import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { SessionRecorder } from "@/components/workout/SessionRecorder";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewSessionPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Get client profile
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) {
    redirect("/client/workout");
  }

  // Get active workout with exercises
  const activeWorkout = await prisma.workout.findFirst({
    where: {
      clientId: clientProfile.id,
      isActive: true,
    },
    include: {
      exercises: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!activeWorkout) {
    return (
      <div className="flex flex-col">
        <Header userName={userName} title="New Session" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No active workout
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                You can&apos;t start a workout without an active program.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Record Workout" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{activeWorkout.name}</h2>
            <p className="text-muted-foreground">
              Record data for each exercise as you work out
            </p>
          </div>

          <SessionRecorder
            workout={activeWorkout}
            clientId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}

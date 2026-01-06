import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { Calendar, Clock, Dumbbell, Play } from "lucide-react";
import { differenceInDays } from "date-fns";
import Link from "next/link";

export default async function WorkoutPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Get client profile
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Get active workout with exercises
  const activeWorkout = clientProfile
    ? await prisma.workout.findFirst({
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
      })
    : null;

  // Calculate days to expiry
  const daysToExpiry = activeWorkout?.expiryDate
    ? differenceInDays(activeWorkout.expiryDate, new Date())
    : null;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="My Workout" />

      <div className="flex-1 space-y-6 p-6">
        {!activeWorkout ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No active workout
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                You don&apos;t have an active workout program yet. Contact your
                personal trainer to get one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Workout Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {activeWorkout.name}
                    </CardTitle>
                    {activeWorkout.description && (
                      <CardDescription className="mt-2">
                        {activeWorkout.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={
                      daysToExpiry && daysToExpiry <= 7
                        ? "destructive"
                        : "default"
                    }
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exercises</p>
                      <p className="text-lg font-semibold">
                        {activeWorkout.exercises.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Estimated duration
                      </p>
                      <p className="text-lg font-semibold">~45-60 min</p>
                    </div>
                  </div>

                  {activeWorkout.expiryDate && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Expires in
                        </p>
                        <p className="text-lg font-semibold">
                          {daysToExpiry !== null && daysToExpiry >= 0
                            ? `${daysToExpiry} days`
                            : "Expired"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href="/client/session/new" className="flex-1">
                    <Button className="w-full" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Start Workout
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Exercises List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Exercises ({activeWorkout.exercises.length})
              </h3>
              {activeWorkout.exercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

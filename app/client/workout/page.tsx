import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { RestTimer } from "@/components/workout/RestTimer";
import { Calendar, Clock, Dumbbell, Play } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera il profilo cliente
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Recupera la scheda attiva con gli esercizi
  const activeWorkout = clientProfile
    ? await prisma.workout.findFirst({
        where: {
          clientId: clientProfile.id,
          isActive: true,
        },
        include: {
          exercises: {
            orderBy: {
              ordine: "asc",
            },
          },
        },
      })
    : null;

  // Calcola giorni alla scadenza
  const daysToExpiry = activeWorkout?.dataScadenza
    ? differenceInDays(activeWorkout.dataScadenza, new Date())
    : null;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Il Mio Allenamento" />

      <div className="flex-1 space-y-6 p-6">
        {!activeWorkout ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nessuna scheda attiva
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Non hai ancora una scheda di allenamento attiva. Contatta il
                tuo personal trainer per riceverne una.
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
                      {activeWorkout.nome}
                    </CardTitle>
                    {activeWorkout.descrizione && (
                      <CardDescription className="mt-2">
                        {activeWorkout.descrizione}
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
                    Attiva
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
                      <p className="text-sm text-muted-foreground">Esercizi</p>
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
                        Durata stimata
                      </p>
                      <p className="text-lg font-semibold">~45-60 min</p>
                    </div>
                  </div>

                  {activeWorkout.dataScadenza && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Scadenza
                        </p>
                        <p className="text-lg font-semibold">
                          {daysToExpiry !== null && daysToExpiry >= 0
                            ? `${daysToExpiry} giorni`
                            : "Scaduta"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href="/client/session/new" className="flex-1">
                    <Button className="w-full" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Inizia Allenamento
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Rest Timer */}
            <div className="lg:hidden">
              <RestTimer defaultSeconds={90} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Exercises List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">
                  Esercizi ({activeWorkout.exercises.length})
                </h3>
                {activeWorkout.exercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>

              {/* Sidebar with Timer - Desktop Only */}
              <div className="hidden lg:block space-y-4">
                <RestTimer defaultSeconds={90} />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Consigli per l'allenamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-muted-foreground">
                        Esegui un riscaldamento di 5-10 minuti prima di iniziare
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-muted-foreground">
                        Mantieni una buona tecnica in ogni esercizio
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-muted-foreground">
                        Rispetta i tempi di recupero tra le serie
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-muted-foreground">
                        Bevi acqua durante l'allenamento
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-muted-foreground">
                        Registra la tua sessione per tracciare i progressi
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

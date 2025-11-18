import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { MultiLineChart } from "@/components/dashboard/MultiLineChart";
import { ClientNotes } from "@/components/client/ClientNotes";
import {
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  TrendingUp,
  FileText,
  Edit,
  Plus,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera i dati del cliente
  const client = await prisma.user.findUnique({
    where: {
      id: params.id,
      role: "CLIENT",
    },
    include: {
      clientProfile: {
        include: {
          workouts: {
            include: {
              exercises: {
                orderBy: {
                  ordine: "asc",
                },
              },
              _count: {
                select: {
                  workoutSessions: true,
                },
              },
            },
            orderBy: {
              dataCreazione: "desc",
            },
          },
        },
      },
      workoutSessions: {
        include: {
          workout: {
            select: {
              nome: true,
            },
          },
        },
        orderBy: {
          data: "desc",
        },
        take: 10,
      },
      measurements: {
        orderBy: {
          data: "desc",
        },
        take: 12,
      },
    },
  });

  if (!client) {
    return notFound();
  }

  const initials = `${client.nome[0]}${client.cognome[0]}`.toUpperCase();
  const activeWorkout = client.clientProfile?.workouts.find((w) => w.isActive);

  // Prepara dati per grafici progressi
  const weightData = client.measurements
    .filter((m) => m.peso)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      peso: m.peso,
    }));

  const bodyMeasurementsData = client.measurements
    .filter((m) => m.petto || m.vita || m.fianchi)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      petto: m.petto || 0,
      vita: m.vita || 0,
      fianchi: m.fianchi || 0,
    }));

  const bodyFatData = client.measurements
    .filter((m) => m.percentualeGrasso)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      grasso: m.percentualeGrasso,
    }));

  const armsLegsData = client.measurements
    .filter((m) => m.braccioSx || m.braccioDx || m.gambaSx || m.gambaDx)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      braccioSx: m.braccioSx || 0,
      braccioDx: m.braccioDx || 0,
      gambaSx: m.gambaSx || 0,
      gambaDx: m.gambaDx || 0,
    }));

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Dettaglio Cliente" />

      <div className="flex-1 space-y-6 p-6">
        {/* Client Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {client.nome} {client.cognome}
                    </h2>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                      {client.telefono && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{client.telefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Iscritto dal{" "}
                          {format(client.dataIscrizione, "dd MMMM yyyy", {
                            locale: it,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/trainer/clients/${params.id}/edit`}>
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifica
                    </Button>
                  </Link>
                </div>

                {client.clientProfile?.obiettivi && (
                  <div className="mt-4 p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium mb-1">Obiettivi</p>
                    <p className="text-sm text-muted-foreground">
                      {client.clientProfile.obiettivi}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{client.workoutSessions.length}</p>
                <p className="text-sm text-muted-foreground">Allenamenti</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{client.measurements.length}</p>
                <p className="text-sm text-muted-foreground">Misurazioni</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {client.clientProfile?.workouts.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Schede</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {client.workoutSessions.filter((s) => s.rating && s.rating >= 4)
                    .length}
                </p>
                <p className="text-sm text-muted-foreground">Feedback Positivi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="workout" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workout">
              <Dumbbell className="mr-2 h-4 w-4" />
              Scheda
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="mr-2 h-4 w-4" />
              Progressi
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <FileText className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="notes">Note</TabsTrigger>
          </TabsList>

          {/* Workout Tab */}
          <TabsContent value="workout" className="space-y-4">
            {activeWorkout ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{activeWorkout.nome}</CardTitle>
                          <Badge>Attiva</Badge>
                        </div>
                        {activeWorkout.descrizione && (
                          <CardDescription>
                            {activeWorkout.descrizione}
                          </CardDescription>
                        )}
                      </div>
                      <Link href={`/trainer/clients/${params.id}/workout/${activeWorkout.id}/edit`}>
                        <Button variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Creata il</p>
                        <p className="font-medium">
                          {format(activeWorkout.dataCreazione, "dd MMMM yyyy", {
                            locale: it,
                          })}
                        </p>
                      </div>
                      {activeWorkout.dataScadenza && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Scadenza
                          </p>
                          <p className="font-medium">
                            {differenceInDays(
                              activeWorkout.dataScadenza,
                              new Date()
                            )}{" "}
                            giorni rimanenti
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Sessioni completate
                        </p>
                        <p className="font-medium">
                          {activeWorkout._count.workoutSessions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    Esercizi ({activeWorkout.exercises.length})
                  </h3>
                  {activeWorkout.exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nessuna scheda attiva
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Questo cliente non ha ancora una scheda di allenamento attiva.
                  </p>
                  <Link href={`/trainer/clients/${params.id}/workout/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Crea Nuova Scheda
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Link href={`/trainer/clients/${params.id}/measurement/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Misurazione
                </Button>
              </Link>
            </div>

            {client.measurements.length > 0 ? (
              <Tabs defaultValue="weight" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="weight">Peso</TabsTrigger>
                  <TabsTrigger value="body">Circonferenze</TabsTrigger>
                  <TabsTrigger value="bodyfat">% Grasso</TabsTrigger>
                  <TabsTrigger value="arms">Braccia/Gambe</TabsTrigger>
                  <TabsTrigger value="table">Storico</TabsTrigger>
                </TabsList>

                <TabsContent value="weight">
                  {weightData.length > 0 ? (
                    <MultiLineChart
                      title="Progressione Peso"
                      description="Andamento del peso corporeo"
                      data={weightData}
                      lines={[
                        {
                          dataKey: "peso",
                          name: "Peso (kg)",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      yAxisLabel="kg"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Nessun dato peso disponibile
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="body">
                  {bodyMeasurementsData.length > 0 ? (
                    <MultiLineChart
                      title="Circonferenze Corporee"
                      description="Andamento petto, vita e fianchi"
                      data={bodyMeasurementsData}
                      lines={[
                        { dataKey: "petto", name: "Petto (cm)", color: "#3b82f6" },
                        { dataKey: "vita", name: "Vita (cm)", color: "#10b981" },
                        { dataKey: "fianchi", name: "Fianchi (cm)", color: "#f59e0b" },
                      ]}
                      yAxisLabel="cm"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Nessun dato circonferenze disponibile
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="bodyfat">
                  {bodyFatData.length > 0 ? (
                    <MultiLineChart
                      title="Percentuale Grasso Corporeo"
                      description="Andamento % grasso corporeo"
                      data={bodyFatData}
                      lines={[
                        {
                          dataKey: "grasso",
                          name: "% Grasso",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      yAxisLabel="%"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Nessun dato % grasso disponibile
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="arms">
                  {armsLegsData.length > 0 ? (
                    <MultiLineChart
                      title="Braccia e Gambe"
                      description="Andamento circonferenze braccia e gambe"
                      data={armsLegsData}
                      lines={[
                        { dataKey: "braccioSx", name: "Braccio Sx (cm)", color: "#3b82f6" },
                        { dataKey: "braccioDx", name: "Braccio Dx (cm)", color: "#06b6d4" },
                        { dataKey: "gambaSx", name: "Gamba Sx (cm)", color: "#10b981" },
                        { dataKey: "gambaDx", name: "Gamba Dx (cm)", color: "#84cc16" },
                      ]}
                      yAxisLabel="cm"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Nessun dato braccia/gambe disponibile
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="table">
                  <Card>
                    <CardHeader>
                      <CardTitle>Storico Misurazioni</CardTitle>
                      <CardDescription>
                        Tutte le misurazioni del cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {client.measurements.map((measurement) => (
                          <div
                            key={measurement.id}
                            className="p-4 border rounded-lg"
                          >
                            <p className="font-medium mb-2">
                              {format(measurement.data, "dd MMMM yyyy", {
                                locale: it,
                              })}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {measurement.peso && (
                                <div>
                                  <span className="text-muted-foreground">Peso:</span>{" "}
                                  <span className="font-medium">{measurement.peso} kg</span>
                                </div>
                              )}
                              {measurement.percentualeGrasso && (
                                <div>
                                  <span className="text-muted-foreground">% Grasso:</span>{" "}
                                  <span className="font-medium">{measurement.percentualeGrasso}%</span>
                                </div>
                              )}
                              {measurement.petto && (
                                <div>
                                  <span className="text-muted-foreground">Petto:</span>{" "}
                                  <span className="font-medium">{measurement.petto} cm</span>
                                </div>
                              )}
                              {measurement.vita && (
                                <div>
                                  <span className="text-muted-foreground">Vita:</span>{" "}
                                  <span className="font-medium">{measurement.vita} cm</span>
                                </div>
                              )}
                              {measurement.fianchi && (
                                <div>
                                  <span className="text-muted-foreground">Fianchi:</span>{" "}
                                  <span className="font-medium">{measurement.fianchi} cm</span>
                                </div>
                              )}
                              {measurement.braccioSx && (
                                <div>
                                  <span className="text-muted-foreground">Braccio Sx:</span>{" "}
                                  <span className="font-medium">{measurement.braccioSx} cm</span>
                                </div>
                              )}
                              {measurement.braccioDx && (
                                <div>
                                  <span className="text-muted-foreground">Braccio Dx:</span>{" "}
                                  <span className="font-medium">{measurement.braccioDx} cm</span>
                                </div>
                              )}
                              {measurement.gambaSx && (
                                <div>
                                  <span className="text-muted-foreground">Gamba Sx:</span>{" "}
                                  <span className="font-medium">{measurement.gambaSx} cm</span>
                                </div>
                              )}
                              {measurement.gambaDx && (
                                <div>
                                  <span className="text-muted-foreground">Gamba Dx:</span>{" "}
                                  <span className="font-medium">{measurement.gambaDx} cm</span>
                                </div>
                              )}
                            </div>
                            {measurement.note && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {measurement.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nessuna misurazione disponibile per questo cliente
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Allenamenti</CardTitle>
                <CardDescription>
                  Commenti e valutazioni delle sessioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                {client.workoutSessions.filter((s) => s.feedback || s.rating)
                  .length > 0 ? (
                  <div className="space-y-4">
                    {client.workoutSessions
                      .filter((s) => s.feedback || s.rating)
                      .map((session) => (
                        <div
                          key={session.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{session.workout.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(session.data, "dd MMMM yyyy 'alle' HH:mm", {
                                  locale: it,
                                })}
                              </p>
                            </div>
                            {session.rating && (
                              <Badge>⭐ {session.rating}/5</Badge>
                            )}
                          </div>
                          {session.feedback && (
                            <p className="text-sm">{session.feedback}</p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nessun feedback disponibile
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Note Private</CardTitle>
                <CardDescription>
                  Annotazioni visibili solo a te
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientNotes
                  clientId={params.id}
                  initialNotes={client.clientProfile?.note || ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

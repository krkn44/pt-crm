import { getSession } from "@/lib/auth-better";
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
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const { id } = await params;
  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Fetch client data
  const client = await prisma.user.findUnique({
    where: {
      id,
      role: "CLIENT",
    },
    include: {
      clientProfile: {
        include: {
          workouts: {
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
          },
        },
      },
      workoutSessions: {
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
        take: 10,
      },
      measurements: {
        orderBy: {
          date: "desc",
        },
        take: 12,
      },
    },
  });

  if (!client) {
    return notFound();
  }

  const initials = `${client.firstName?.[0] || ""}${client.lastName?.[0] || ""}`.toUpperCase();
  const activeWorkout = client.clientProfile?.workouts.find((w) => w.isActive);

  // Prepare data for progress charts
  const weightData = client.measurements
    .filter((m) => m.weight !== null)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      weight: m.weight as number,
    }));

  const bodyMeasurementsData = client.measurements
    .filter((m) => m.chest || m.waist || m.hips)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      chest: m.chest || 0,
      waist: m.waist || 0,
      hips: m.hips || 0,
    }));

  const bodyFatData = client.measurements
    .filter((m) => m.bodyFatPercentage !== null)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      fat: m.bodyFatPercentage as number,
    }));

  const armsLegsData = client.measurements
    .filter((m) => m.bicepRelaxed || m.bicepContracted || m.quadRelaxed || m.quadContracted)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      bicepRelaxed: m.bicepRelaxed || 0,
      bicepContracted: m.bicepContracted || 0,
      quadRelaxed: m.quadRelaxed || 0,
      quadContracted: m.quadContracted || 0,
    }));

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Client Details" />

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
                      {client.firstName} {client.lastName}
                    </h2>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Member since{" "}
                          {format(client.registrationDate, "dd MMMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/trainer/clients/${id}/edit`}>
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>

                {client.clientProfile?.goals && (
                  <div className="mt-4 p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium mb-1">Goals</p>
                    <p className="text-sm text-muted-foreground">
                      {client.clientProfile.goals}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{client.workoutSessions.length}</p>
                <p className="text-sm text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{client.measurements.length}</p>
                <p className="text-sm text-muted-foreground">Measurements</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {client.clientProfile?.workouts.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Programs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {client.workoutSessions.filter((s) => s.rating && s.rating >= 4)
                    .length}
                </p>
                <p className="text-sm text-muted-foreground">Positive Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="workout" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workout">
              <Dumbbell className="mr-2 h-4 w-4" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="mr-2 h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <FileText className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
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
                          <CardTitle>{activeWorkout.name}</CardTitle>
                          <Badge>Active</Badge>
                        </div>
                        {activeWorkout.description && (
                          <CardDescription>
                            {activeWorkout.description}
                          </CardDescription>
                        )}
                      </div>
                      <Link href={`/trainer/clients/${id}/workout/${activeWorkout.id}/edit`}>
                        <Button variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Created on</p>
                        <p className="font-medium">
                          {format(activeWorkout.createdDate, "dd MMMM yyyy")}
                        </p>
                      </div>
                      {activeWorkout.expiryDate && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Expires in
                          </p>
                          <p className="font-medium">
                            {differenceInDays(
                              activeWorkout.expiryDate,
                              new Date()
                            )}{" "}
                            days remaining
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Sessions completed
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
                    Exercises ({activeWorkout.exercises.length})
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
                    No active workout
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    This client doesn&apos;t have an active workout program yet.
                  </p>
                  <Link href={`/trainer/clients/${id}/workout/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Workout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Link href={`/trainer/clients/${id}/measurement/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Measurement
                </Button>
              </Link>
            </div>

            {client.measurements.length > 0 ? (
              <Tabs defaultValue="weight" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="body">Measurements</TabsTrigger>
                  <TabsTrigger value="bodyfat">Body Fat %</TabsTrigger>
                  <TabsTrigger value="arms">Arms/Legs</TabsTrigger>
                  <TabsTrigger value="table">History</TabsTrigger>
                </TabsList>

                <TabsContent value="weight">
                  {weightData.length > 0 ? (
                    <MultiLineChart
                      title="Weight Progress"
                      description="Body weight trend"
                      data={weightData}
                      lines={[
                        {
                          dataKey: "weight",
                          name: "Weight (kg)",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      yAxisLabel="kg"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No weight data available
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="body">
                  {bodyMeasurementsData.length > 0 ? (
                    <MultiLineChart
                      title="Body Measurements"
                      description="Chest, waist and hips trend"
                      data={bodyMeasurementsData}
                      lines={[
                        { dataKey: "chest", name: "Chest (cm)", color: "#3b82f6" },
                        { dataKey: "waist", name: "Waist (cm)", color: "#10b981" },
                        { dataKey: "hips", name: "Hips (cm)", color: "#f59e0b" },
                      ]}
                      yAxisLabel="cm"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No body measurement data available
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="bodyfat">
                  {bodyFatData.length > 0 ? (
                    <MultiLineChart
                      title="Body Fat Percentage"
                      description="Body fat % trend"
                      data={bodyFatData}
                      lines={[
                        {
                          dataKey: "fat",
                          name: "Body Fat %",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      yAxisLabel="%"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No body fat data available
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="arms">
                  {armsLegsData.length > 0 ? (
                    <MultiLineChart
                      title="Biceps and Quadriceps"
                      description="Arms and legs measurements trend (weak side)"
                      data={armsLegsData}
                      lines={[
                        { dataKey: "bicepRelaxed", name: "Bicep Relaxed (cm)", color: "#3b82f6" },
                        { dataKey: "bicepContracted", name: "Bicep Contracted (cm)", color: "#06b6d4" },
                        { dataKey: "quadRelaxed", name: "Quad Relaxed (cm)", color: "#10b981" },
                        { dataKey: "quadContracted", name: "Quad Contracted (cm)", color: "#84cc16" },
                      ]}
                      yAxisLabel="cm"
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No arms/legs data available
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="table">
                  <Card>
                    <CardHeader>
                      <CardTitle>Measurement History</CardTitle>
                      <CardDescription>
                        All client measurements
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
                              {format(measurement.date, "dd MMMM yyyy")}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {measurement.weight && (
                                <div>
                                  <span className="text-muted-foreground">Weight:</span>{" "}
                                  <span className="font-medium">{measurement.weight} kg</span>
                                </div>
                              )}
                              {measurement.bodyFatPercentage && (
                                <div>
                                  <span className="text-muted-foreground">Body Fat:</span>{" "}
                                  <span className="font-medium">{measurement.bodyFatPercentage}%</span>
                                </div>
                              )}
                              {measurement.chest && (
                                <div>
                                  <span className="text-muted-foreground">Chest:</span>{" "}
                                  <span className="font-medium">{measurement.chest} cm</span>
                                </div>
                              )}
                              {measurement.waist && (
                                <div>
                                  <span className="text-muted-foreground">Waist:</span>{" "}
                                  <span className="font-medium">{measurement.waist} cm</span>
                                </div>
                              )}
                              {measurement.hips && (
                                <div>
                                  <span className="text-muted-foreground">Hips:</span>{" "}
                                  <span className="font-medium">{measurement.hips} cm</span>
                                </div>
                              )}
                              {measurement.shoulders && (
                                <div>
                                  <span className="text-muted-foreground">Shoulders:</span>{" "}
                                  <span className="font-medium">{measurement.shoulders} cm</span>
                                </div>
                              )}
                              {measurement.bicepRelaxed && (
                                <div>
                                  <span className="text-muted-foreground">Bicep Relaxed:</span>{" "}
                                  <span className="font-medium">{measurement.bicepRelaxed} cm</span>
                                </div>
                              )}
                              {measurement.bicepContracted && (
                                <div>
                                  <span className="text-muted-foreground">Bicep Contracted:</span>{" "}
                                  <span className="font-medium">{measurement.bicepContracted} cm</span>
                                </div>
                              )}
                              {measurement.quadRelaxed && (
                                <div>
                                  <span className="text-muted-foreground">Quad Relaxed:</span>{" "}
                                  <span className="font-medium">{measurement.quadRelaxed} cm</span>
                                </div>
                              )}
                              {measurement.quadContracted && (
                                <div>
                                  <span className="text-muted-foreground">Quad Contracted:</span>{" "}
                                  <span className="font-medium">{measurement.quadContracted} cm</span>
                                </div>
                              )}
                              {measurement.calfContracted && (
                                <div>
                                  <span className="text-muted-foreground">Calf Contracted:</span>{" "}
                                  <span className="font-medium">{measurement.calfContracted} cm</span>
                                </div>
                              )}
                            </div>
                            {measurement.notes && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {measurement.notes}
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
                  No measurements available for this client
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Feedback</CardTitle>
                <CardDescription>
                  Comments and ratings from sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {client.workoutSessions.filter((s) => s.feedback || s.rating)
                  .length > 0 ? (
                  <div className="space-y-4">
                    {client.workoutSessions
                      .filter((s) => s.feedback || s.rating)
                      .map((workoutSession) => (
                        <div
                          key={workoutSession.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{workoutSession.workout.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(workoutSession.date, "dd MMMM yyyy 'at' HH:mm")}
                              </p>
                            </div>
                            {workoutSession.rating && (
                              <Badge>{workoutSession.rating}/5</Badge>
                            )}
                          </div>
                          {workoutSession.feedback && (
                            <p className="text-sm">{workoutSession.feedback}</p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No feedback available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Private Notes</CardTitle>
                <CardDescription>
                  Notes visible only to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientNotes
                  clientId={id}
                  initialNotes={client.clientProfile?.notes || ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiLineChart } from "@/components/dashboard/MultiLineChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingDown, TrendingUp, Calendar, Ruler, Weight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera misurazioni
  const measurements = await prisma.measurement.findMany({
    where: { clientId: session.user.id },
    orderBy: { data: "desc" },
    take: 12, // Ultimi 3 mesi circa
  });

  // Recupera sessioni allenamento
  const sessions = await prisma.workoutSession.findMany({
    where: { clientId: session.user.id },
    orderBy: { data: "desc" },
    take: 30,
    include: {
      workout: {
        select: {
          nome: true,
        },
      },
    },
  });

  // Recupera checkpoint
  const checkpoints = await prisma.checkpoint.findMany({
    where: { clientId: session.user.id },
    orderBy: { data: "desc" },
  });

  // Prepara dati per i grafici
  const weightData = measurements
    .filter((m) => m.peso)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      peso: m.peso,
    }));

  const bodyMeasurementsData = measurements
    .filter((m) => m.petto || m.vita || m.fianchi)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      petto: m.petto || 0,
      vita: m.vita || 0,
      fianchi: m.fianchi || 0,
    }));

  const bodyFatData = measurements
    .filter((m) => m.percentualeGrasso)
    .reverse()
    .map((m) => ({
      date: format(m.data, "dd/MM", { locale: it }),
      grasso: m.percentualeGrasso,
    }));

  // Statistiche
  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const weightChange = latestMeasurement && previousMeasurement
    ? ((latestMeasurement.peso || 0) - (previousMeasurement.peso || 0)).toFixed(1)
    : null;

  const bodyFatChange = latestMeasurement && previousMeasurement
    ? ((latestMeasurement.percentualeGrasso || 0) - (previousMeasurement.percentualeGrasso || 0)).toFixed(1)
    : null;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="I Miei Progressi" />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Peso Attuale"
            value={latestMeasurement?.peso ? `${latestMeasurement.peso} kg` : "N/A"}
            description={
              weightChange
                ? `${parseFloat(weightChange) > 0 ? "+" : ""}${weightChange} kg dall'ultima misurazione`
                : undefined
            }
            icon={Weight}
          />
          <StatsCard
            title="% Grasso Corporeo"
            value={
              latestMeasurement?.percentualeGrasso
                ? `${latestMeasurement.percentualeGrasso}%`
                : "N/A"
            }
            description={
              bodyFatChange
                ? `${parseFloat(bodyFatChange) > 0 ? "+" : ""}${bodyFatChange}% dall'ultima misurazione`
                : undefined
            }
            icon={TrendingDown}
          />
          <StatsCard
            title="Allenamenti Totali"
            value={sessions.length}
            description="Sessioni completate"
            icon={Calendar}
          />
          <StatsCard
            title="Ultima Misurazione"
            value={
              latestMeasurement
                ? format(latestMeasurement.data, "dd MMM", { locale: it })
                : "N/A"
            }
            description={measurements.length > 0 ? `${measurements.length} misurazioni totali` : undefined}
            icon={Ruler}
          />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="weight" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weight">Peso</TabsTrigger>
            <TabsTrigger value="body">Circonferenze</TabsTrigger>
            <TabsTrigger value="bodyfat">% Grasso</TabsTrigger>
            <TabsTrigger value="measurements">Misurazioni</TabsTrigger>
            <TabsTrigger value="sessions">Allenamenti</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4">
            {weightData.length > 0 ? (
              <MultiLineChart
                title="Progressione Peso"
                description="Andamento del peso corporeo negli ultimi mesi"
                data={weightData}
                lines={[
                  { dataKey: "peso", name: "Peso (kg)", color: "hsl(var(--primary))" },
                ]}
                yAxisLabel="kg"
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Nessun dato disponibile. Aggiungi la prima misurazione!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            {bodyMeasurementsData.length > 0 ? (
              <MultiLineChart
                title="Circonferenze Corporee"
                description="Andamento delle circonferenze corporee"
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
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Nessun dato disponibile. Aggiungi la prima misurazione!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bodyfat" className="space-y-4">
            {bodyFatData.length > 0 ? (
              <MultiLineChart
                title="Percentuale Grasso Corporeo"
                description="Andamento della percentuale di grasso corporeo"
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
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Nessun dato disponibile. Aggiungi la prima misurazione!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Storico Misurazioni</CardTitle>
                    <CardDescription>
                      Tutte le tue misurazioni corporee
                    </CardDescription>
                  </div>
                  <Link href="/client/progress/new">
                    <Button>Nuova Misurazione</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {measurements.length > 0 ? (
                  <div className="space-y-4">
                    {measurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {format(measurement.data, "dd MMMM yyyy", {
                              locale: it,
                            })}
                          </p>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {measurement.peso && (
                              <div>
                                <span className="text-muted-foreground">
                                  Peso:
                                </span>{" "}
                                <span className="font-medium">
                                  {measurement.peso} kg
                                </span>
                              </div>
                            )}
                            {measurement.percentualeGrasso && (
                              <div>
                                <span className="text-muted-foreground">
                                  % Grasso:
                                </span>{" "}
                                <span className="font-medium">
                                  {measurement.percentualeGrasso}%
                                </span>
                              </div>
                            )}
                            {measurement.petto && (
                              <div>
                                <span className="text-muted-foreground">
                                  Petto:
                                </span>{" "}
                                <span className="font-medium">
                                  {measurement.petto} cm
                                </span>
                              </div>
                            )}
                            {measurement.vita && (
                              <div>
                                <span className="text-muted-foreground">
                                  Vita:
                                </span>{" "}
                                <span className="font-medium">
                                  {measurement.vita} cm
                                </span>
                              </div>
                            )}
                          </div>
                          {measurement.note && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {measurement.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nessuna misurazione registrata
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storico Allenamenti</CardTitle>
                <CardDescription>
                  Le tue sessioni di allenamento completate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{session.workout.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(session.data, "dd MMMM yyyy 'alle' HH:mm", {
                              locale: it,
                            })}
                          </p>
                          {session.feedback && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {session.feedback}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {session.durata && (
                            <Badge variant="outline">
                              {session.durata} min
                            </Badge>
                          )}
                          {session.rating && (
                            <Badge>⭐ {session.rating}/5</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nessuna sessione registrata
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

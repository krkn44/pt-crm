import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Star, TrendingUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera tutti i clienti
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      nome: true,
      cognome: true,
    },
  });

  // Recupera tutte le sessioni con dettagli
  const allSessions = await prisma.workoutSession.findMany({
    include: {
      client: {
        select: {
          id: true,
          nome: true,
          cognome: true,
        },
      },
      workout: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: {
      data: "desc",
    },
  });

  // Sessioni di questa settimana
  const thisWeekStart = startOfWeek(new Date(), { locale: it });
  const thisWeekEnd = endOfWeek(new Date(), { locale: it });
  const thisWeekSessions = allSessions.filter(
    (s) => s.data >= thisWeekStart && s.data <= thisWeekEnd
  );

  // Sessioni di questo mese
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthSessions = allSessions.filter(
    (s) => s.data >= thisMonthStart && s.data <= thisMonthEnd
  );

  // Calcola statistiche
  const totalSessions = allSessions.length;
  const completedSessions = allSessions.filter((s) => s.completato).length;
  const sessionsWithFeedback = allSessions.filter((s) => s.feedback || s.rating).length;
  const averageRating = allSessions.filter((s) => s.rating).length > 0
    ? (allSessions.reduce((sum, s) => sum + (s.rating || 0), 0) /
        allSessions.filter((s) => s.rating).length).toFixed(1)
    : "N/A";

  // Sessioni per cliente
  const sessionsByClient = clients.map((client) => {
    const clientSessions = allSessions.filter((s) => s.client.id === client.id);
    return {
      client,
      count: clientSessions.length,
      lastSession: clientSessions[0]?.data,
      averageRating: clientSessions.filter((s) => s.rating).length > 0
        ? (clientSessions.reduce((sum, s) => sum + (s.rating || 0), 0) /
            clientSessions.filter((s) => s.rating).length).toFixed(1)
        : null,
    };
  }).sort((a, b) => b.count - a.count);

  // Feedback recenti (ultimi 30)
  const recentFeedback = allSessions
    .filter((s) => s.feedback || s.rating)
    .slice(0, 30);

  // Feedback negativi (rating <= 2)
  const negativeFeedback = allSessions
    .filter((s) => s.rating && s.rating <= 2)
    .slice(0, 10);

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Analytics" />

      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics e Statistiche
          </h2>
          <p className="text-muted-foreground">
            Panoramica completa delle sessioni e feedback dei clienti
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Sessioni Totali"
            value={totalSessions}
            description={`${completedSessions} completate`}
            icon={BarChart3}
          />
          <StatsCard
            title="Questa Settimana"
            value={thisWeekSessions.length}
            description={`${Math.round((thisWeekSessions.length / 7))} media al giorno`}
            icon={Calendar}
          />
          <StatsCard
            title="Questo Mese"
            value={thisMonthSessions.length}
            description={`${clients.length} clienti attivi`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Rating Medio"
            value={averageRating}
            description={`${sessionsWithFeedback} con feedback`}
            icon={Star}
          />
        </div>

        {/* Tabs per diverse viste */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessioni Recenti</TabsTrigger>
            <TabsTrigger value="feedback">Tutti i Feedback</TabsTrigger>
            <TabsTrigger value="clients">Per Cliente</TabsTrigger>
            <TabsTrigger value="negative">Feedback Negativi</TabsTrigger>
          </TabsList>

          {/* Sessioni Recenti */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessioni Recenti</CardTitle>
                <CardDescription>
                  Ultime 30 sessioni di allenamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allSessions.length > 0 ? (
                  <div className="space-y-3">
                    {allSessions.slice(0, 30).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {session.client.nome} {session.client.cognome}
                            </p>
                            {session.completato && (
                              <Badge variant="outline" className="text-xs">
                                Completato
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.workout.nome}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>
                              {format(session.data, "dd MMMM yyyy 'alle' HH:mm", {
                                locale: it,
                              })}
                            </span>
                            {session.durata && <span>• {session.durata} min</span>}
                          </div>
                          {session.feedback && (
                            <p className="mt-2 text-sm italic">
                              "{session.feedback}"
                            </p>
                          )}
                        </div>
                        {session.rating && (
                          <div className="flex items-center gap-1 ml-4">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{session.rating}/5</span>
                          </div>
                        )}
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

          {/* Tutti i Feedback */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Ricevuti</CardTitle>
                <CardDescription>
                  Tutti i commenti e valutazioni dei clienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentFeedback.length > 0 ? (
                  <div className="space-y-3">
                    {recentFeedback.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {session.client.nome} {session.client.cognome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.workout.nome} •{" "}
                              {format(session.data, "dd MMM yyyy", { locale: it })}
                            </p>
                          </div>
                          {session.rating && (
                            <Badge
                              variant={session.rating >= 4 ? "default" : session.rating === 3 ? "secondary" : "destructive"}
                            >
                              ⭐ {session.rating}/5
                            </Badge>
                          )}
                        </div>
                        {session.feedback && (
                          <p className="text-sm mt-2 p-3 bg-secondary/50 rounded">
                            {session.feedback}
                          </p>
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

          {/* Per Cliente */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche per Cliente</CardTitle>
                <CardDescription>
                  Riepilogo sessioni e rating per ogni cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionsByClient.map((item) => (
                    <div
                      key={item.client.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {item.client.nome} {item.client.cognome}
                        </p>
                        {item.lastSession && (
                          <p className="text-sm text-muted-foreground">
                            Ultima sessione:{" "}
                            {format(item.lastSession, "dd MMM yyyy", { locale: it })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{item.count}</p>
                          <p className="text-xs text-muted-foreground">sessioni</p>
                        </div>
                        {item.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{item.averageRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Negativi */}
          <TabsContent value="negative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback da Migliorare</CardTitle>
                <CardDescription>
                  Sessioni con rating basso (≤ 2 stelle)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {negativeFeedback.length > 0 ? (
                  <div className="space-y-3">
                    {negativeFeedback.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 border border-destructive/50 rounded-lg bg-destructive/5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {session.client.nome} {session.client.cognome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.workout.nome} •{" "}
                              {format(session.data, "dd MMM yyyy", { locale: it })}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            ⭐ {session.rating}/5
                          </Badge>
                        </div>
                        {session.feedback && (
                          <p className="text-sm mt-2 p-3 bg-background rounded">
                            {session.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-green-600 font-medium">
                      Ottimo lavoro! Nessun feedback negativo
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tutti i clienti sono soddisfatti
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

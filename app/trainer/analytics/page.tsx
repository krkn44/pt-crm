import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DateFilter } from "@/components/filters/DateFilter";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Star, TrendingUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

const ITEMS_PER_PAGE = 20;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { page?: string; dateFrom?: string; dateTo?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;
  const currentPage = Number(searchParams.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Prepara filtri per data
  const dateFilter: any = {};
  if (searchParams.dateFrom) {
    dateFilter.gte = new Date(searchParams.dateFrom);
  }
  if (searchParams.dateTo) {
    const dateTo = new Date(searchParams.dateTo);
    dateTo.setHours(23, 59, 59, 999); // Fine giornata
    dateFilter.lte = dateTo;
  }

  const whereClause = Object.keys(dateFilter).length > 0
    ? { data: dateFilter }
    : {};

  // Recupera tutti i clienti
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      nome: true,
      cognome: true,
    },
  });

  // Count totale sessioni (per paginazione e stats)
  const totalSessions = await prisma.workoutSession.count({
    where: whereClause,
  });

  // Recupera sessioni paginate con filtri
  const paginatedSessions = await prisma.workoutSession.findMany({
    where: whereClause,
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
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Recupera tutte le sessioni per le statistiche (senza paginazione)
  const allSessionsForStats = await prisma.workoutSession.findMany({
    where: whereClause,
    select: {
      id: true,
      data: true,
      completato: true,
      feedback: true,
      rating: true,
      clientId: true,
    },
  });

  // Sessioni di questa settimana
  const thisWeekStart = startOfWeek(new Date(), { locale: it });
  const thisWeekEnd = endOfWeek(new Date(), { locale: it });
  const thisWeekSessions = allSessionsForStats.filter(
    (s) => s.data >= thisWeekStart && s.data <= thisWeekEnd
  );

  // Sessioni di questo mese
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthSessions = allSessionsForStats.filter(
    (s) => s.data >= thisMonthStart && s.data <= thisMonthEnd
  );

  // Calcola statistiche
  const completedSessions = allSessionsForStats.filter((s) => s.completato).length;
  const sessionsWithFeedback = allSessionsForStats.filter((s) => s.feedback || s.rating).length;
  const averageRating = allSessionsForStats.filter((s) => s.rating).length > 0
    ? (allSessionsForStats.reduce((sum, s) => sum + (s.rating || 0), 0) /
        allSessionsForStats.filter((s) => s.rating).length).toFixed(1)
    : "N/A";

  // Count per feedback tab (con filtri)
  const totalFeedbackCount = await prisma.workoutSession.count({
    where: {
      ...whereClause,
      OR: [
        { feedback: { not: null } },
        { rating: { not: null } },
      ],
    },
  });

  // Sessioni con feedback paginate
  const paginatedFeedback = await prisma.workoutSession.findMany({
    where: {
      ...whereClause,
      OR: [
        { feedback: { not: null } },
        { rating: { not: null } },
      ],
    },
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
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Count per feedback negativi
  const totalNegativeFeedbackCount = await prisma.workoutSession.count({
    where: {
      ...whereClause,
      rating: { lte: 2 },
    },
  });

  // Feedback negativi paginati
  const paginatedNegativeFeedback = await prisma.workoutSession.findMany({
    where: {
      ...whereClause,
      rating: { lte: 2 },
    },
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
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Sessioni per cliente (senza paginazione, mostriamo tutti)
  const sessionsByClient = await Promise.all(
    clients.map(async (client) => {
      const clientSessions = await prisma.workoutSession.findMany({
        where: {
          ...whereClause,
          clientId: client.id,
        },
        select: {
          id: true,
          data: true,
          rating: true,
        },
        orderBy: {
          data: "desc",
        },
      });

      return {
        client,
        count: clientSessions.length,
        lastSession: clientSessions[0]?.data,
        averageRating: clientSessions.filter((s) => s.rating).length > 0
          ? (clientSessions.reduce((sum, s) => sum + (s.rating || 0), 0) /
              clientSessions.filter((s) => s.rating).length).toFixed(1)
          : null,
      };
    })
  );

  const sortedSessionsByClient = sessionsByClient
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalPages = Math.ceil(totalSessions / ITEMS_PER_PAGE);
  const totalFeedbackPages = Math.ceil(totalFeedbackCount / ITEMS_PER_PAGE);
  const totalNegativePages = Math.ceil(totalNegativeFeedbackCount / ITEMS_PER_PAGE);

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

        {/* Filtri per data */}
        <DateFilter />

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
            description={`${clients.length} clienti`}
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
                  {totalSessions > 0
                    ? `${totalSessions} session${totalSessions !== 1 ? "i" : "e"} totali`
                    : "Nessuna sessione"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedSessions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedSessions.map((session) => (
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
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalSessions}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
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
                  {totalFeedbackCount > 0
                    ? `${totalFeedbackCount} feedback totali`
                    : "Nessun feedback"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedFeedback.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedFeedback.map((session) => (
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
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalFeedbackPages}
                      totalItems={totalFeedbackCount}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
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
                {sortedSessionsByClient.length > 0 ? (
                  <div className="space-y-3">
                    {sortedSessionsByClient.map((item) => (
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
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nessuna sessione nel periodo selezionato
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Negativi */}
          <TabsContent value="negative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback da Migliorare</CardTitle>
                <CardDescription>
                  {totalNegativeFeedbackCount > 0
                    ? `${totalNegativeFeedbackCount} sessioni con rating ≤ 2 stelle`
                    : "Nessun feedback negativo"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedNegativeFeedback.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedNegativeFeedback.map((session) => (
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
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalNegativePages}
                      totalItems={totalNegativeFeedbackCount}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
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

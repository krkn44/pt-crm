import { getSession } from "@/lib/auth-better";
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

const ITEMS_PER_PAGE = 20;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const userName = `${session.user.firstName} ${session.user.lastName}`;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Prepare date filters
  const dateFilter: any = {};
  if (resolvedSearchParams.dateFrom) {
    dateFilter.gte = new Date(resolvedSearchParams.dateFrom);
  }
  if (resolvedSearchParams.dateTo) {
    const dateTo = new Date(resolvedSearchParams.dateTo);
    dateTo.setHours(23, 59, 59, 999); // End of day
    dateFilter.lte = dateTo;
  }

  const whereClause = Object.keys(dateFilter).length > 0
    ? { date: dateFilter }
    : {};

  // Fetch all clients
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  // Total sessions count (for pagination and stats)
  const totalSessions = await prisma.workoutSession.count({
    where: whereClause,
  });

  // Fetch paginated sessions with filters
  const paginatedSessions = await prisma.workoutSession.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      workout: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Fetch all sessions for statistics (without pagination)
  const allSessionsForStats = await prisma.workoutSession.findMany({
    where: whereClause,
    select: {
      id: true,
      date: true,
      completed: true,
      feedback: true,
      rating: true,
      clientId: true,
    },
  });

  // Sessions this week
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekSessions = allSessionsForStats.filter(
    (s) => s.date >= thisWeekStart && s.date <= thisWeekEnd
  );

  // Sessions this month
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthSessions = allSessionsForStats.filter(
    (s) => s.date >= thisMonthStart && s.date <= thisMonthEnd
  );

  // Calculate statistics
  const completedSessions = allSessionsForStats.filter((s) => s.completed).length;
  const sessionsWithFeedback = allSessionsForStats.filter((s) => s.feedback || s.rating).length;
  const averageRating = allSessionsForStats.filter((s) => s.rating).length > 0
    ? (allSessionsForStats.reduce((sum, s) => sum + (s.rating || 0), 0) /
        allSessionsForStats.filter((s) => s.rating).length).toFixed(1)
    : "N/A";

  // Count for feedback tab (with filters)
  const totalFeedbackCount = await prisma.workoutSession.count({
    where: {
      ...whereClause,
      OR: [
        { feedback: { not: null } },
        { rating: { not: null } },
      ],
    },
  });

  // Paginated sessions with feedback
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
          firstName: true,
          lastName: true,
        },
      },
      workout: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Count for negative feedback
  const totalNegativeFeedbackCount = await prisma.workoutSession.count({
    where: {
      ...whereClause,
      rating: { lte: 2 },
    },
  });

  // Paginated negative feedback
  const paginatedNegativeFeedback = await prisma.workoutSession.findMany({
    where: {
      ...whereClause,
      rating: { lte: 2 },
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      workout: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Sessions per client (without pagination, show all)
  const sessionsByClient = await Promise.all(
    clients.map(async (client) => {
      const clientSessions = await prisma.workoutSession.findMany({
        where: {
          ...whereClause,
          clientId: client.id,
        },
        select: {
          id: true,
          date: true,
          rating: true,
        },
        orderBy: {
          date: "desc",
        },
      });

      return {
        client,
        count: clientSessions.length,
        lastSession: clientSessions[0]?.date,
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
            Analytics & Statistics
          </h2>
          <p className="text-muted-foreground">
            Complete overview of sessions and client feedback
          </p>
        </div>

        {/* Date Filters */}
        <DateFilter />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Sessions"
            value={totalSessions}
            description={`${completedSessions} completed`}
            icon={BarChart3}
          />
          <StatsCard
            title="This Week"
            value={thisWeekSessions.length}
            description={`${Math.round((thisWeekSessions.length / 7))} avg per day`}
            icon={Calendar}
          />
          <StatsCard
            title="This Month"
            value={thisMonthSessions.length}
            description={`${clients.length} clients`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Average Rating"
            value={averageRating}
            description={`${sessionsWithFeedback} with feedback`}
            icon={Star}
          />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
            <TabsTrigger value="feedback">All Feedback</TabsTrigger>
            <TabsTrigger value="clients">By Client</TabsTrigger>
            <TabsTrigger value="negative">Negative Feedback</TabsTrigger>
          </TabsList>

          {/* Recent Sessions */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>
                  {totalSessions > 0
                    ? `${totalSessions} total session${totalSessions !== 1 ? "s" : ""}`
                    : "No sessions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedSessions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedSessions.map((workoutSession) => (
                        <div
                          key={workoutSession.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {workoutSession.client.firstName} {workoutSession.client.lastName}
                              </p>
                              {workoutSession.completed && (
                                <Badge variant="outline" className="text-xs">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {workoutSession.workout.name}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>
                                {format(workoutSession.date, "dd MMMM yyyy 'at' HH:mm")}
                              </span>
                              {workoutSession.duration && <span>• {workoutSession.duration} min</span>}
                            </div>
                            {workoutSession.feedback && (
                              <p className="mt-2 text-sm italic">
                                &quot;{workoutSession.feedback}&quot;
                              </p>
                            )}
                          </div>
                          {workoutSession.rating && (
                            <div className="flex items-center gap-1 ml-4">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{workoutSession.rating}/5</span>
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
                    No sessions recorded
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Feedback */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Received Feedback</CardTitle>
                <CardDescription>
                  {totalFeedbackCount > 0
                    ? `${totalFeedbackCount} total feedback`
                    : "No feedback"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedFeedback.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedFeedback.map((workoutSession) => (
                        <div
                          key={workoutSession.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                {workoutSession.client.firstName} {workoutSession.client.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {workoutSession.workout.name} •{" "}
                                {format(workoutSession.date, "dd MMM yyyy")}
                              </p>
                            </div>
                            {workoutSession.rating && (
                              <Badge
                                variant={workoutSession.rating >= 4 ? "default" : workoutSession.rating === 3 ? "secondary" : "destructive"}
                              >
                                {workoutSession.rating}/5
                              </Badge>
                            )}
                          </div>
                          {workoutSession.feedback && (
                            <p className="text-sm mt-2 p-3 bg-secondary/50 rounded">
                              {workoutSession.feedback}
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
                    No feedback available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Client */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistics by Client</CardTitle>
                <CardDescription>
                  Sessions and rating summary for each client
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
                            {item.client.firstName} {item.client.lastName}
                          </p>
                          {item.lastSession && (
                            <p className="text-sm text-muted-foreground">
                              Last session:{" "}
                              {format(item.lastSession, "dd MMM yyyy")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{item.count}</p>
                            <p className="text-xs text-muted-foreground">sessions</p>
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
                    No sessions in the selected period
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Negative Feedback */}
          <TabsContent value="negative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback to Improve</CardTitle>
                <CardDescription>
                  {totalNegativeFeedbackCount > 0
                    ? `${totalNegativeFeedbackCount} sessions with rating ≤ 2 stars`
                    : "No negative feedback"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedNegativeFeedback.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedNegativeFeedback.map((workoutSession) => (
                        <div
                          key={workoutSession.id}
                          className="p-4 border border-destructive/50 rounded-lg bg-destructive/5"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                {workoutSession.client.firstName} {workoutSession.client.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {workoutSession.workout.name} •{" "}
                                {format(workoutSession.date, "dd MMM yyyy")}
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {workoutSession.rating}/5
                            </Badge>
                          </div>
                          {workoutSession.feedback && (
                            <p className="text-sm mt-2 p-3 bg-background rounded">
                              {workoutSession.feedback}
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
                      Great job! No negative feedback
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All clients are satisfied
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

import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiLineChart } from "@/components/dashboard/MultiLineChart";
import { MeasurementHistory } from "@/components/client/MeasurementHistory";
import { TrendingDown, Calendar, Ruler, Weight, Star } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function ProgressPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Get measurements
  const measurements = await prisma.measurement.findMany({
    where: { clientId: session.user.id },
    orderBy: { date: "desc" },
    take: 12, // Last 3 months approximately
  });

  // Get workout sessions
  const sessions = await prisma.workoutSession.findMany({
    where: { clientId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
    include: {
      workout: {
        select: {
          name: true,
        },
      },
    },
  });

  // Prepare chart data
  const weightData = measurements
    .filter((m) => m.weight !== null)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      weight: m.weight as number,
    }));

  const bodyMeasurementsData = measurements
    .filter((m) => m.chest || m.waist || m.hips)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      chest: m.chest || 0,
      waist: m.waist || 0,
      hips: m.hips || 0,
    }));

  const bodyFatData = measurements
    .filter((m) => m.bodyFatPercentage !== null)
    .reverse()
    .map((m) => ({
      date: format(m.date, "dd/MM"),
      bodyFat: m.bodyFatPercentage as number,
    }));

  // Statistics
  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const weightChange = latestMeasurement && previousMeasurement
    ? ((latestMeasurement.weight || 0) - (previousMeasurement.weight || 0)).toFixed(1)
    : null;

  const bodyFatChange = latestMeasurement && previousMeasurement
    ? ((latestMeasurement.bodyFatPercentage || 0) - (previousMeasurement.bodyFatPercentage || 0)).toFixed(1)
    : null;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="My Progress" />

      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Stats Cards - Compact on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                  <Weight className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Weight</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {latestMeasurement?.weight ? `${latestMeasurement.weight}` : "N/A"}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-0.5">kg</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg shrink-0">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Body Fat %</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {latestMeasurement?.bodyFatPercentage ? `${latestMeasurement.bodyFatPercentage}` : "N/A"}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-0.5">%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Sessions</p>
                  <p className="text-lg sm:text-2xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Last meas.</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {latestMeasurement
                      ? format(latestMeasurement.date, "dd/MM")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views - Scrollable on mobile */}
        <Tabs defaultValue="weight" className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full">
              <TabsTrigger value="weight" className="text-xs sm:text-sm px-2 sm:px-3">Weight</TabsTrigger>
              <TabsTrigger value="bodyfat" className="text-xs sm:text-sm px-2 sm:px-3">Body Fat %</TabsTrigger>
              <TabsTrigger value="body" className="text-xs sm:text-sm px-2 sm:px-3">Measurements</TabsTrigger>
              <TabsTrigger value="measurements" className="text-xs sm:text-sm px-2 sm:px-3">History</TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs sm:text-sm px-2 sm:px-3">Workouts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weight" className="space-y-4">
            {weightData.length > 0 ? (
              <MultiLineChart
                title="Weight"
                description="Body weight trend"
                data={weightData}
                lines={[
                  { dataKey: "weight", name: "Weight (kg)", color: "hsl(var(--primary))" },
                ]}
                yAxisLabel="kg"
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <Weight className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    No data available
                  </p>
                  <Link href="/client/progress/new" className="mt-3">
                    <Button size="sm">Add measurement</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            {bodyMeasurementsData.length > 0 ? (
              <MultiLineChart
                title="Body Measurements"
                description="Chest, waist and hips"
                data={bodyMeasurementsData}
                lines={[
                  { dataKey: "chest", name: "Chest", color: "#3b82f6" },
                  { dataKey: "waist", name: "Waist", color: "#10b981" },
                  { dataKey: "hips", name: "Hips", color: "#f59e0b" },
                ]}
                yAxisLabel="cm"
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <Ruler className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    No data available
                  </p>
                  <Link href="/client/progress/new" className="mt-3">
                    <Button size="sm">Add measurement</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bodyfat" className="space-y-4">
            {bodyFatData.length > 0 ? (
              <MultiLineChart
                title="Body Fat Percentage"
                description="Body fat trend"
                data={bodyFatData}
                lines={[
                  {
                    dataKey: "bodyFat",
                    name: "Body Fat %",
                    color: "hsl(var(--primary))",
                  },
                ]}
                yAxisLabel="%"
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <TrendingDown className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    No data available
                  </p>
                  <Link href="/client/progress/new" className="mt-3">
                    <Button size="sm">Add measurement</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg">History</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      All measurements
                    </CardDescription>
                  </div>
                  <Link href="/client/progress/new">
                    <Button size="sm">New</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <MeasurementHistory
                  measurements={measurements.map((m) => ({
                    id: m.id,
                    date: m.date.toISOString(),
                    weight: m.weight,
                    bodyFatPercentage: m.bodyFatPercentage,
                    chest: m.chest,
                    waist: m.waist,
                    hips: m.hips,
                    notes: m.notes,
                  }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Workouts</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Completed sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                {sessions.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {sessions.map((s) => (
                      <Link href={`/client/diary/${s.id}`} key={s.id}>
                        <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">{s.workout.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {format(s.date, "dd MMM 'at' HH:mm")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 ml-2">
                            {s.rating && (
                              <Badge className="text-xs px-1.5">
                                <Star className="h-3 w-3 mr-0.5 fill-current" />
                                {s.rating}
                              </Badge>
                            )}
                            {s.duration && (
                              <Badge variant="outline" className="hidden sm:flex text-xs">
                                {s.duration}m
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No sessions recorded
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

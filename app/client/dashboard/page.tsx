import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, TrendingUp, Flame } from "lucide-react";

// Dati mock per la demo
const mockWeightData = [
  { date: "1 Nov", value: 78 },
  { date: "8 Nov", value: 77.5 },
  { date: "15 Nov", value: 77 },
  { date: "22 Nov", value: 76.8 },
  { date: "29 Nov", value: 76.5 },
];

const mockActivities = [
  {
    id: "1",
    title: "Allenamento completato",
    description: "Scheda Full Body - Durata: 45 minuti",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 ore fa
    type: "workout" as const,
  },
  {
    id: "2",
    title: "Nuova misurazione",
    description: "Peso: 76.5kg, Circonferenza vita: 82cm",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 giorno fa
    type: "measurement" as const,
  },
];

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  const userName = `${session?.user.nome} ${session?.user.cognome}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Benvenuto, {session?.user.nome}!
          </h2>
          <p className="text-muted-foreground">
            Ecco il riepilogo delle tue attività
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Allenamenti questo mese"
            value="12"
            description="3 questa settimana"
            icon={Dumbbell}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Streak consecutivo"
            value="5 giorni"
            description="Continua così!"
            icon={Flame}
          />
          <StatsCard
            title="Peso attuale"
            value="76.5 kg"
            description="-1.5kg dal mese scorso"
            icon={TrendingUp}
            trend={{ value: 2, isPositive: true }}
          />
          <StatsCard
            title="Prossimo appuntamento"
            value="3 giorni"
            description="Venerdì 15:00"
            icon={Calendar}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <ProgressChart
              title="Progressi Peso"
              description="Ultimi 30 giorni"
              data={mockWeightData}
            />
          </div>
          <div className="col-span-3">
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>

        {/* Next Workout Card */}
        <Card>
          <CardHeader>
            <CardTitle>Prossimo Allenamento</CardTitle>
            <CardDescription>
              La tua scheda attiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Scheda Full Body A</h3>
                <p className="text-sm text-muted-foreground">
                  8 esercizi • ~45 minuti
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Scadenza scheda</p>
                <p className="text-sm text-muted-foreground">
                  14 giorni rimanenti
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

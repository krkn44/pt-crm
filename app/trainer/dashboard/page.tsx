import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCheck, Bell, TrendingUp } from "lucide-react";

// Dati mock per la demo
const mockClients = [
  {
    id: "1",
    nome: "Mario Rossi",
    ultimoAllenamento: "2 ore fa",
    status: "active", // active, warning, inactive
    schedaScadenza: 14,
  },
  {
    id: "2",
    nome: "Laura Bianchi",
    ultimoAllenamento: "1 giorno fa",
    status: "active",
    schedaScadenza: 21,
  },
  {
    id: "3",
    nome: "Giuseppe Verdi",
    ultimoAllenamento: "5 giorni fa",
    status: "warning",
    schedaScadenza: 7,
  },
  {
    id: "4",
    nome: "Anna Neri",
    ultimoAllenamento: "10 giorni fa",
    status: "inactive",
    schedaScadenza: 3,
  },
];

const statusConfig = {
  active: {
    badge: "bg-green-500",
    label: "Attivo",
  },
  warning: {
    badge: "bg-yellow-500",
    label: "Attenzione",
  },
  inactive: {
    badge: "bg-red-500",
    label: "Inattivo",
  },
};

export default async function TrainerDashboard() {
  const session = await getServerSession(authOptions);
  const userName = `${session?.user.nome} ${session?.user.cognome}`;

  const activeClients = mockClients.filter((c) => c.status === "active").length;
  const warningClients = mockClients.filter((c) => c.status === "warning").length;
  const inactiveClients = mockClients.filter((c) => c.status === "inactive").length;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Dashboard Trainer" />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Benvenuto, {session?.user.nome}!
          </h2>
          <p className="text-muted-foreground">
            Panoramica dei tuoi clienti
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Clienti totali"
            value={mockClients.length}
            description="Nel tuo portfolio"
            icon={Users}
          />
          <StatsCard
            title="Clienti attivi"
            value={activeClients}
            description="Allenati di recente"
            icon={UserCheck}
          />
          <StatsCard
            title="Richiedono attenzione"
            value={warningClients + inactiveClients}
            description="Inattivi o schede in scadenza"
            icon={Bell}
          />
          <StatsCard
            title="Sessioni questa settimana"
            value="48"
            description="+12% dalla scorsa settimana"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
          />
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>I tuoi Clienti</CardTitle>
            <CardDescription>
              Stato attuale dei clienti e scadenze schede
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClients.map((client) => {
                const config = statusConfig[client.status];
                const initials = client.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("");

                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${config.badge}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{client.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Ultimo allenamento: {client.ultimoAllenamento}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Scadenza scheda
                        </p>
                        <p
                          className={`text-sm ${
                            client.schedaScadenza <= 7
                              ? "text-red-600 font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {client.schedaScadenza} giorni
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${config.badge} text-white border-none`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Notifiche Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Mario Rossi ha completato un allenamento
                    </p>
                    <p className="text-xs text-muted-foreground">2 ore fa</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Scheda di Anna Neri in scadenza tra 3 giorni
                    </p>
                    <p className="text-xs text-muted-foreground">5 ore fa</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Giuseppe Verdi non si allena da 5 giorni
                    </p>
                    <p className="text-xs text-muted-foreground">1 giorno fa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schede in Scadenza</CardTitle>
              <CardDescription>Prossimi 7 giorni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockClients
                  .filter((c) => c.schedaScadenza <= 7)
                  .map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <p className="text-sm font-medium">{client.nome}</p>
                      <Badge variant="destructive">
                        {client.schedaScadenza} giorni
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

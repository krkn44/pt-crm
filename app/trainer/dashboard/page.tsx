import { getSession } from "@/lib/auth-better";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCheck, Bell, TrendingUp } from "lucide-react";

// Mock data for demo
const mockClients = [
  {
    id: "1",
    name: "Mario Rossi",
    lastWorkout: "2 hours ago",
    status: "active" as const,
    cardExpiry: 14,
  },
  {
    id: "2",
    name: "Laura Bianchi",
    lastWorkout: "1 day ago",
    status: "active" as const,
    cardExpiry: 21,
  },
  {
    id: "3",
    name: "Giuseppe Verdi",
    lastWorkout: "5 days ago",
    status: "warning" as const,
    cardExpiry: 7,
  },
  {
    id: "4",
    name: "Anna Neri",
    lastWorkout: "10 days ago",
    status: "inactive" as const,
    cardExpiry: 3,
  },
];

const statusConfig = {
  active: {
    badge: "bg-green-500",
    label: "Active",
  },
  warning: {
    badge: "bg-yellow-500",
    label: "Warning",
  },
  inactive: {
    badge: "bg-red-500",
    label: "Inactive",
  },
};

export default async function TrainerDashboard() {
  const session = await getSession();
  const userName = `${session?.user.firstName} ${session?.user.lastName}`;

  const activeClients = mockClients.filter((c) => c.status === "active").length;
  const warningClients = mockClients.filter((c) => c.status === "warning").length;
  const inactiveClients = mockClients.filter((c) => c.status === "inactive").length;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Trainer Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {session?.user.firstName}!
          </h2>
          <p className="text-muted-foreground">
            Overview of your clients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clients"
            value={mockClients.length}
            description="In your portfolio"
            icon={Users}
          />
          <StatsCard
            title="Active Clients"
            value={activeClients}
            description="Trained recently"
            icon={UserCheck}
          />
          <StatsCard
            title="Need Attention"
            value={warningClients + inactiveClients}
            description="Inactive or expiring cards"
            icon={Bell}
          />
          <StatsCard
            title="Sessions This Week"
            value="48"
            description="+12% from last week"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
          />
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>
              Current status and card expiration dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClients.map((client) => {
                const config = statusConfig[client.status];
                const initials = client.name
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
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last workout: {client.lastWorkout}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Card Expiry
                        </p>
                        <p
                          className={`text-sm ${
                            client.cardExpiry <= 7
                              ? "text-red-600 font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {client.cardExpiry} days
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
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Mario Rossi completed a workout
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Anna Neri&apos;s card expires in 3 days
                    </p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Giuseppe Verdi hasn&apos;t trained in 5 days
                    </p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expiring Cards</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockClients
                  .filter((c) => c.cardExpiry <= 7)
                  .map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <p className="text-sm font-medium">{client.name}</p>
                      <Badge variant="destructive">
                        {client.cardExpiry} days
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

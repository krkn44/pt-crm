import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ClientCard } from "@/components/client/ClientCard";
import { ClientSearch } from "@/components/client/ClientSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search } from "lucide-react";
import { differenceInDays } from "date-fns";
import Link from "next/link";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const userName = `${session.user.firstName} ${session.user.lastName}`;
  const searchQuery = resolvedSearchParams.search?.toLowerCase() || "";

  // Fetch all clients with their information
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
    },
    include: {
      clientProfile: true,
      workoutSessions: {
        orderBy: {
          date: "desc",
        },
        take: 1,
      },
      _count: {
        select: {
          workoutSessions: true,
          measurements: true,
        },
      },
    },
    orderBy: {
      firstName: "asc",
    },
  });

  // Calculate status for each client
  const clientsWithStatus = clients.map((client) => {
    const lastSession = client.workoutSessions[0]?.date;
    let status: "active" | "warning" | "inactive" = "active";

    if (lastSession) {
      const daysSinceLastSession = differenceInDays(new Date(), lastSession);
      if (daysSinceLastSession > 7) {
        status = "inactive";
      } else if (daysSinceLastSession >= 3) {
        status = "warning";
      }
    } else {
      status = "inactive";
    }

    // Check card expiry date too
    if (client.clientProfile?.cardExpiryDate) {
      const daysToExpiry = differenceInDays(
        client.clientProfile.cardExpiryDate,
        new Date()
      );
      if (daysToExpiry <= 7 && status === "active") {
        status = "warning";
      }
    }

    return {
      ...client,
      status,
      lastSession,
    };
  });

  // Filter clients by search
  const filteredClients = searchQuery
    ? clientsWithStatus.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const email = c.email.toLowerCase();
        return fullName.includes(searchQuery) || email.includes(searchQuery);
      })
    : clientsWithStatus;

  // Filter clients by status
  const activeClients = filteredClients.filter((c) => c.status === "active");
  const warningClients = filteredClients.filter((c) => c.status === "warning");
  const inactiveClients = filteredClients.filter(
    (c) => c.status === "inactive"
  );

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Client Management" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Clients</h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? `${filteredClients.length} of ${clients.length} client${clients.length !== 1 ? "s" : ""}`
                : `${clients.length} total client${clients.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/trainer/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <ClientSearch />

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeClients.length}</p>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{warningClients.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Need Attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inactiveClients.length}</p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List with Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredClients.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeClients.length})
            </TabsTrigger>
            <TabsTrigger value="warning">
              Warning ({warningClients.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveClients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  lastSession={client.lastSession}
                  status={client.status}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No clients
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    You don&apos;t have any registered clients yet. Start by adding your
                    first client.
                  </p>
                  <Link href="/trainer/clients/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Client
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeClients.length > 0 ? (
              activeClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  lastSession={client.lastSession}
                  status={client.status}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No active clients
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="warning" className="space-y-4">
            {warningClients.length > 0 ? (
              warningClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  lastSession={client.lastSession}
                  status={client.status}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No clients need attention
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {inactiveClients.length > 0 ? (
              inactiveClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  lastSession={client.lastSession}
                  status={client.status}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No inactive clients
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ClientCard } from "@/components/client/ClientCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search } from "lucide-react";
import { differenceInDays } from "date-fns";
import Link from "next/link";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera tutti i clienti con le loro informazioni
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
    },
    include: {
      clientProfile: true,
      workoutSessions: {
        orderBy: {
          data: "desc",
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
      nome: "asc",
    },
  });

  // Calcola lo stato di ogni cliente
  const clientsWithStatus = clients.map((client) => {
    const lastSession = client.workoutSessions[0]?.data;
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

    // Controlla anche la scadenza della scheda
    if (client.clientProfile?.scadenzaScheda) {
      const daysToExpiry = differenceInDays(
        client.clientProfile.scadenzaScheda,
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

  // Filtra clienti per stato
  const activeClients = clientsWithStatus.filter((c) => c.status === "active");
  const warningClients = clientsWithStatus.filter((c) => c.status === "warning");
  const inactiveClients = clientsWithStatus.filter(
    (c) => c.status === "inactive"
  );

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Gestione Clienti" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">I Tuoi Clienti</h2>
            <p className="text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? "i" : "e"} totali
            </p>
          </div>
          <Link href="/trainer/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Cliente
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca cliente per nome o email..."
            className="pl-9"
          />
        </div>

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
                  <p className="text-sm text-muted-foreground">Clienti Attivi</p>
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
                    Richiedono Attenzione
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
                  <p className="text-sm text-muted-foreground">Inattivi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List with Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              Tutti ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Attivi ({activeClients.length})
            </TabsTrigger>
            <TabsTrigger value="warning">
              Attenzione ({warningClients.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inattivi ({inactiveClients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {clientsWithStatus.length > 0 ? (
              clientsWithStatus.map((client) => (
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
                    Nessun cliente
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Non hai ancora clienti registrati. Inizia aggiungendo il tuo
                    primo cliente.
                  </p>
                  <Link href="/trainer/clients/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi Cliente
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
                  Nessun cliente attivo
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
                  Nessun cliente richiede attenzione
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
                  Nessun cliente inattivo
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

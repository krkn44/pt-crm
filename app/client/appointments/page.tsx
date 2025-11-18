import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus } from "lucide-react";

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Mock data per ora
  const upcomingAppointments = [
    {
      id: "1",
      data: "2024-11-22",
      ora: "15:00",
      tipo: "Check-in Mensile",
      stato: "CONFIRMED",
    },
    {
      id: "2",
      data: "2024-11-29",
      ora: "10:00",
      tipo: "Valutazione Progressi",
      stato: "PENDING",
    },
  ];

  const pastAppointments = [
    {
      id: "3",
      data: "2024-11-10",
      ora: "15:00",
      tipo: "Prima Valutazione",
      stato: "COMPLETED",
    },
  ];

  const statusConfig = {
    PENDING: { label: "In attesa", variant: "outline" as const },
    CONFIRMED: { label: "Confermato", variant: "default" as const },
    COMPLETED: { label: "Completato", variant: "secondary" as const },
    CANCELLED: { label: "Cancellato", variant: "destructive" as const },
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Appuntamenti" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              I Tuoi Appuntamenti
            </h2>
            <p className="text-muted-foreground">
              Gestisci i tuoi appuntamenti con il personal trainer
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Appuntamento
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Prossimi Appuntamenti</CardTitle>
            <CardDescription>
              Appuntamenti programmati con il tuo trainer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.tipo}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(appointment.data).toLocaleDateString(
                              "it-IT",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              }
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.ora}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusConfig[appointment.stato].variant}>
                        {statusConfig[appointment.stato].label}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Dettagli
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nessun appuntamento programmato
              </p>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Storico Appuntamenti</CardTitle>
            <CardDescription>Appuntamenti passati</CardDescription>
          </CardHeader>
          <CardContent>
            {pastAppointments.length > 0 ? (
              <div className="space-y-3">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg opacity-75"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.tipo}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.data).toLocaleDateString(
                            "it-IT"
                          )}{" "}
                          alle {appointment.ora}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusConfig[appointment.stato].variant}>
                      {statusConfig[appointment.stato].label}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nessun appuntamento passato
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  Come prenotare un appuntamento
                </h4>
                <p className="text-sm text-muted-foreground">
                  Clicca su "Nuovo Appuntamento" per richiedere un incontro con
                  il tuo trainer. Potrai scegliere data e ora tra gli slot
                  disponibili. Il trainer confermerà la prenotazione.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera notifiche del trainer
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      dataCreazione: "desc",
    },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.letto).length;

  const notificationTypeLabels = {
    WORKOUT_COMPLETED: { label: "Allenamento", color: "bg-blue-500" },
    WORKOUT_REMINDER: { label: "Promemoria", color: "bg-yellow-500" },
    APPOINTMENT_SCHEDULED: { label: "Appuntamento", color: "bg-green-500" },
    APPOINTMENT_REMINDER: { label: "Promemoria", color: "bg-yellow-500" },
    MEASUREMENT_ADDED: { label: "Misurazione", color: "bg-purple-500" },
    CHECKPOINT_DUE: { label: "Checkpoint", color: "bg-orange-500" },
    FEEDBACK_RECEIVED: { label: "Feedback", color: "bg-pink-500" },
    INACTIVITY_WARNING: { label: "Inattività", color: "bg-red-500" },
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Notifiche" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifiche</h2>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} notifiche non lette`
                : "Tutte le notifiche lette"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline">
              <Check className="mr-2 h-4 w-4" />
              Segna tutte come lette
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tutte le Notifiche</CardTitle>
            <CardDescription>
              Aggiornamenti e attività dei tuoi clienti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const config = notificationTypeLabels[notification.tipo];
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        !notification.letto ? "bg-accent/50" : ""
                      }`}
                    >
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${config.color}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">
                            {notification.messaggio}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.dataCreazione, {
                            addSuffix: true,
                            locale: it,
                          })}
                        </p>
                      </div>
                      {!notification.letto && (
                        <Button variant="ghost" size="sm">
                          Segna come letta
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nessuna notifica disponibile
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

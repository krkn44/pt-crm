import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { SessionRecorder } from "@/components/workout/SessionRecorder";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewSessionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera il profilo cliente
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) {
    redirect("/client/dashboard");
  }

  // Recupera la scheda attiva con gli esercizi
  const activeWorkout = await prisma.workout.findFirst({
    where: {
      clientId: clientProfile.id,
      isActive: true,
    },
    include: {
      exercises: {
        orderBy: {
          ordine: "asc",
        },
      },
    },
  });

  if (!activeWorkout) {
    return (
      <div className="flex flex-col">
        <Header userName={userName} title="Nuova Sessione" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nessuna scheda attiva
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Non puoi iniziare un allenamento senza una scheda attiva.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Registra Allenamento" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{activeWorkout.nome}</h2>
            <p className="text-muted-foreground">
              Registra i dati di ogni esercizio mentre ti alleni
            </p>
          </div>

          <SessionRecorder
            workout={activeWorkout}
            clientId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}

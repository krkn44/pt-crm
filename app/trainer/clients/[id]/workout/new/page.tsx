import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { WorkoutEditor } from "@/components/workout/WorkoutEditor";
import { notFound } from "next/navigation";

export default async function NewWorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera il cliente
  const client = await prisma.user.findUnique({
    where: {
      id: params.id,
      role: "CLIENT",
    },
  });

  if (!client) {
    return notFound();
  }

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Nuova Scheda" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Crea Nuova Scheda per {client.nome} {client.cognome}
            </h2>
            <p className="text-muted-foreground">
              Aggiungi esercizi dalla libreria o crea esercizi personalizzati
            </p>
          </div>

          <WorkoutEditor clientId={params.id} />
        </div>
      </div>
    </div>
  );
}

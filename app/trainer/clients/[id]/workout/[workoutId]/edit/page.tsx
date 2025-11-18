import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { WorkoutEditor } from "@/components/workout/WorkoutEditor";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EditWorkoutPage({
  params,
}: {
  params: { id: string; workoutId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  // Recupera il cliente con il profilo
  const client = await prisma.user.findUnique({
    where: {
      id: params.id,
      role: "CLIENT",
    },
    include: {
      clientProfile: true,
    },
  });

  if (!client || !client.clientProfile) {
    return notFound();
  }

  // Recupera la scheda da modificare
  const workout = await prisma.workout.findUnique({
    where: {
      id: params.workoutId,
    },
    include: {
      exercises: {
        orderBy: {
          ordine: "asc",
        },
      },
    },
  });

  if (!workout || workout.clientId !== client.clientProfile.id) {
    return notFound();
  }

  // Prepara i dati per WorkoutEditor
  const initialData = {
    id: workout.id,
    nome: workout.nome,
    descrizione: workout.descrizione || "",
    dataScadenza: workout.dataScadenza
      ? format(workout.dataScadenza, "yyyy-MM-dd")
      : "",
    exercises: workout.exercises.map((ex) => ({
      nome: ex.nome,
      serie: ex.serie,
      ripetizioni: ex.ripetizioni,
      peso: ex.peso || "",
      recupero: ex.recupero || "",
      note: ex.note || "",
      videoUrl: ex.videoUrl || "",
    })),
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Modifica Scheda" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Modifica Scheda per {client.nome} {client.cognome}
            </h2>
            <p className="text-muted-foreground">
              Aggiorna gli esercizi e le informazioni della scheda
            </p>
          </div>

          <WorkoutEditor clientId={params.id} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}

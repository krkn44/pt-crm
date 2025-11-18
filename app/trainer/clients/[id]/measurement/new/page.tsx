import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { notFound } from "next/navigation";

export default async function NewMeasurementPage({
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
      <Header userName={userName} title="Nuova Misurazione" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Aggiungi Misurazione per {client.nome} {client.cognome}
            </h2>
            <p className="text-muted-foreground">
              Registra i dati corporei del cliente per tracciare i progressi
            </p>
          </div>

          <MeasurementForm
            clientId={params.id}
            redirectUrl={`/trainer/clients/${params.id}`}
          />
        </div>
      </div>
    </div>
  );
}

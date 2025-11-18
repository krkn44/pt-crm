import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ClientEditForm } from "@/components/forms/ClientEditForm";
import { notFound } from "next/navigation";

export default async function EditClientPage({
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
    include: {
      clientProfile: true,
    },
  });

  if (!client) {
    return notFound();
  }

  const initialData = {
    nome: client.nome,
    cognome: client.cognome,
    email: client.email,
    telefono: client.telefono,
    obiettivi: client.clientProfile?.obiettivi || null,
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Modifica Cliente" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Modifica Dati di {client.nome} {client.cognome}
            </h2>
            <p className="text-muted-foreground">
              Aggiorna le informazioni personali e gli obiettivi del cliente
            </p>
          </div>

          <ClientEditForm clientId={params.id} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}

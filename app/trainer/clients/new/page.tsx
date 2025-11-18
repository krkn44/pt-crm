import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { ClientAddForm } from "@/components/forms/ClientAddForm";
import { notFound } from "next/navigation";

export default async function NewClientPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Nuovo Cliente" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Aggiungi Nuovo Cliente</h2>
            <p className="text-muted-foreground">
              Crea un account per un nuovo cliente del tuo programma di training
            </p>
          </div>

          <ClientAddForm />
        </div>
      </div>
    </div>
  );
}

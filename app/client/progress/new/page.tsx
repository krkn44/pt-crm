import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { redirect } from "next/navigation";

export default async function NewMeasurementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Nuova Misurazione" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Aggiungi Misurazione</h2>
            <p className="text-muted-foreground">
              Registra i tuoi dati corporei per tracciare i progressi
            </p>
          </div>

          <MeasurementForm clientId={session.user.id} />
        </div>
      </div>
    </div>
  );
}

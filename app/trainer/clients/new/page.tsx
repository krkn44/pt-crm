import { getSession } from "@/lib/auth-better";
import { Header } from "@/components/layout/Header";
import { ClientAddForm } from "@/components/forms/ClientAddForm";
import { notFound } from "next/navigation";

export default async function NewClientPage() {
  const session = await getSession();

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="New Client" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Add New Client</h2>
            <p className="text-muted-foreground">
              Create an account for a new client in your training program
            </p>
          </div>

          <ClientAddForm />
        </div>
      </div>
    </div>
  );
}

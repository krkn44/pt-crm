import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ClientEditForm } from "@/components/forms/ClientEditForm";
import { notFound } from "next/navigation";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "TRAINER") {
    return notFound();
  }

  const { id } = await params;
  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Fetch client
  const client = await prisma.user.findUnique({
    where: {
      id,
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
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    goals: client.clientProfile?.goals || null,
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Edit Client" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Edit {client.firstName} {client.lastName}&apos;s Data
            </h2>
            <p className="text-muted-foreground">
              Update personal information and client goals
            </p>
          </div>

          <ClientEditForm clientId={id} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}

import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { notFound } from "next/navigation";

export default async function NewMeasurementPage({
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
  });

  if (!client) {
    return notFound();
  }

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="New Measurement" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Add Measurement for {client.firstName} {client.lastName}
            </h2>
            <p className="text-muted-foreground">
              Record client body measurements to track progress
            </p>
          </div>

          <MeasurementForm
            clientId={id}
            redirectUrl={`/trainer/clients/${id}`}
          />
        </div>
      </div>
    </div>
  );
}

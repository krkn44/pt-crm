import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";

interface EditMeasurementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMeasurementPage({ params }: EditMeasurementPageProps) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    redirect("/auth/signin");
  }

  const measurement = await prisma.measurement.findUnique({
    where: { id },
  });

  if (!measurement) {
    notFound();
  }

  // Authorization check - clients can only edit their own measurements
  if (measurement.clientId !== session.user.id) {
    redirect("/client/progress");
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  // Prepare initial data for the form
  const initialData = {
    date: format(measurement.date, "yyyy-MM-dd"),
    weight: measurement.weight?.toString() || "",
    chest: measurement.chest?.toString() || "",
    shoulders: measurement.shoulders?.toString() || "",
    waist: measurement.waist?.toString() || "",
    hips: measurement.hips?.toString() || "",
    bicepRelaxed: measurement.bicepRelaxed?.toString() || "",
    bicepContracted: measurement.bicepContracted?.toString() || "",
    quadRelaxed: measurement.quadRelaxed?.toString() || "",
    quadContracted: measurement.quadContracted?.toString() || "",
    calfContracted: measurement.calfContracted?.toString() || "",
    bodyFatPercentage: measurement.bodyFatPercentage?.toString() || "",
    notes: measurement.notes || "",
  };

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Edit Measurement" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Edit Measurement</h2>
            <p className="text-muted-foreground">
              Update the measurement from {format(measurement.date, "dd MMM yyyy")}
            </p>
          </div>

          <MeasurementForm
            clientId={session.user.id}
            measurementId={id}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
}

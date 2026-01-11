import { getSession } from "@/lib/auth-better";
import { Header } from "@/components/layout/Header";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { redirect } from "next/navigation";

export default async function NewMeasurementPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="New Measurement" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Add Measurement</h2>
            <p className="text-muted-foreground">
              Record your body measurements to track your progress
            </p>
          </div>

          <MeasurementForm clientId={session.user.id} />
        </div>
      </div>
    </div>
  );
}

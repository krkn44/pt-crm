import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { WorkoutEditor } from "@/components/workout/WorkoutEditor";
import { notFound } from "next/navigation";

export default async function NewWorkoutPage({
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
      <Header userName={userName} title="New Workout" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Create New Workout for {client.firstName} {client.lastName}
            </h2>
            <p className="text-muted-foreground">
              Add exercises from the library or create custom exercises
            </p>
          </div>

          <WorkoutEditor clientId={id} />
        </div>
      </div>
    </div>
  );
}

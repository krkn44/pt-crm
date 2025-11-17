import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "TRAINER") {
    redirect("/client/dashboard");
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  return (
    <div className="flex h-screen">
      <Sidebar role="TRAINER" userName={userName} />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}

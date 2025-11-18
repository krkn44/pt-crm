import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Se l'utente è autenticato, reindirizza alla dashboard appropriata
  if (session?.user) {
    if (session.user.role === "TRAINER") {
      redirect("/trainer/dashboard");
    } else {
      redirect("/client/dashboard");
    }
  }

  // Se non è autenticato, mostra la landing page con link al login
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">PT CRM</h1>
        <p className="text-muted-foreground text-lg">
          Sistema di gestione per personal trainer
        </p>
        <Link href="/auth/signin">
          <Button size="lg">Accedi</Button>
        </Link>
      </div>
    </div>
  );
}

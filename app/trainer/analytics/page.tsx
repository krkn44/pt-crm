import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Analytics" />

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground text-center">
              Funzionalità in sviluppo. Qui vedrai statistiche aggregate di tutti i
              clienti, grafici costanza allenamenti e report mensili automatici.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

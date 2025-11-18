import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const userName = `${session.user.nome} ${session.user.cognome}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Gestione Schede" />

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Editor Schede</h3>
            <p className="text-muted-foreground text-center mb-4">
              Funzionalità in sviluppo. Qui potrai creare e gestire template di
              schede di allenamento riutilizzabili.
            </p>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Crea Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

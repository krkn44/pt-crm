import { getSession } from "@/lib/auth-better";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";

export default async function WorkoutsPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const userName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <div className="flex flex-col">
      <Header userName={userName} title="Workout Management" />

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Workout Editor</h3>
            <p className="text-muted-foreground text-center mb-4">
              Feature under development. Here you will be able to create and manage
              reusable workout templates.
            </p>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ClientNotesProps {
  clientId: string;
  initialNotes: string;
}

export function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore nel salvare le note");
      }

      // Ricarica i dati
      router.refresh();
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore nel salvare le note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder="Scrivi note sul cliente..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvataggio...
          </>
        ) : (
          "Salva Note"
        )}
      </Button>
    </div>
  );
}

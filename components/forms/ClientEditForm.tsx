"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ClientEditFormProps {
  clientId: string;
  initialData: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string | null;
    obiettivi: string | null;
  };
}

export function ClientEditForm({ clientId, initialData }: ClientEditFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData.nome,
    cognome: initialData.cognome,
    telefono: initialData.telefono || "",
    obiettivi: initialData.obiettivi || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Errore nel salvare i dati");
      }

      // Torna alla pagina del cliente
      router.push(`/trainer/clients/${clientId}`);
      router.refresh();
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore nel salvare i dati");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Cliente</CardTitle>
          <CardDescription>
            Modifica i dati personali e gli obiettivi del cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome">Cognome *</Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) =>
                  setFormData({ ...formData, cognome: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              L&apos;email non può essere modificata
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              placeholder="+39 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obiettivi">Obiettivi</Label>
            <Textarea
              id="obiettivi"
              value={formData.obiettivi}
              onChange={(e) =>
                setFormData({ ...formData, obiettivi: e.target.value })
              }
              placeholder="Descrivi gli obiettivi del cliente..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva Modifiche"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Annulla
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ClientAddForm() {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    password: "",
    telefono: "",
    obiettivi: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nel creare il cliente");
      }

      // Vai alla pagina del nuovo cliente
      router.push(`/trainer/clients/${data.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Errore:", error);
      setError(error.message || "Errore nel creare il cliente");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Nuovo Cliente</CardTitle>
          <CardDescription>
            Inserisci i dati del nuovo cliente per registrarlo nel sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

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
                placeholder="Mario"
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
                placeholder="Rossi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="mario.rossi@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Verrà utilizzata per accedere all&apos;app
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              placeholder="Minimo 6 caratteri"
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Password per l&apos;accesso del cliente (minimo 6 caratteri)
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
                  Creazione...
                </>
              ) : (
                "Crea Cliente"
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

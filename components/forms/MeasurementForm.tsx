"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

interface MeasurementFormProps {
  clientId: string;
  redirectUrl?: string; // URL di redirect personalizzato dopo salvataggio
}

export function MeasurementForm({ clientId, redirectUrl }: MeasurementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0], // Data odierna come default
    peso: "",
    altezza: "",
    petto: "",
    vita: "",
    fianchi: "",
    braccioSx: "",
    braccioDx: "",
    gambaSx: "",
    gambaDx: "",
    percentualeGrasso: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/measurements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          ...formData,
        }),
      });

      if (response.ok) {
        router.push(redirectUrl || "/client/progress");
        router.refresh();
      } else {
        alert("Errore nel salvare la misurazione");
      }
    } catch (error) {
      alert("Errore nel salvare la misurazione");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Dati Corporei</CardTitle>
          <CardDescription>
            Inserisci le tue misurazioni. Tutti i campi sono opzionali.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="base" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="base">Dati Base</TabsTrigger>
              <TabsTrigger value="circonferenze">Circonferenze</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data Misurazione *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => updateField("data", e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Specifica quando è stata effettuata la misurazione
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={formData.peso}
                    onChange={(e) => updateField("peso", e.target.value)}
                    placeholder="75.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altezza">Altezza (cm)</Label>
                  <Input
                    id="altezza"
                    type="number"
                    step="0.1"
                    min="0"
                    max="250"
                    value={formData.altezza}
                    onChange={(e) => updateField("altezza", e.target.value)}
                    placeholder="175"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentualeGrasso">% Grasso Corporeo</Label>
                  <Input
                    id="percentualeGrasso"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.percentualeGrasso}
                    onChange={(e) =>
                      updateField("percentualeGrasso", e.target.value)
                    }
                    placeholder="15.5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="circonferenze" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petto">Petto (cm)</Label>
                  <Input
                    id="petto"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.petto}
                    onChange={(e) => updateField("petto", e.target.value)}
                    placeholder="95"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vita">Vita (cm)</Label>
                  <Input
                    id="vita"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vita}
                    onChange={(e) => updateField("vita", e.target.value)}
                    placeholder="85"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fianchi">Fianchi (cm)</Label>
                  <Input
                    id="fianchi"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fianchi}
                    onChange={(e) => updateField("fianchi", e.target.value)}
                    placeholder="98"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="braccioSx">Braccio Sinistro (cm)</Label>
                  <Input
                    id="braccioSx"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.braccioSx}
                    onChange={(e) => updateField("braccioSx", e.target.value)}
                    placeholder="32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="braccioDx">Braccio Destro (cm)</Label>
                  <Input
                    id="braccioDx"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.braccioDx}
                    onChange={(e) => updateField("braccioDx", e.target.value)}
                    placeholder="32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gambaSx">Gamba Sinistra (cm)</Label>
                  <Input
                    id="gambaSx"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.gambaSx}
                    onChange={(e) => updateField("gambaSx", e.target.value)}
                    placeholder="56"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gambaDx">Gamba Destra (cm)</Label>
                  <Input
                    id="gambaDx"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.gambaDx}
                    onChange={(e) => updateField("gambaDx", e.target.value)}
                    placeholder="56"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="note" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  placeholder="Aggiungi eventuali note sulla misurazione..."
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvataggio..." : "Salva Misurazione"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

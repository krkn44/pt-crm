"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exerciseLibrary, exerciseCategories, type ExerciseTemplate } from "@/lib/exercise-library";
import { Plus, X, GripVertical, Save, Library } from "lucide-react";

interface Exercise {
  nome: string;
  serie: number;
  ripetizioni: string;
  peso?: string;
  recupero?: string;
  note?: string;
  videoUrl?: string;
}

interface WorkoutEditorProps {
  clientId: string;
  initialData?: {
    id?: string;
    nome: string;
    descrizione?: string;
    dataScadenza?: string;
    exercises: Exercise[];
  };
  onSuccess?: () => void;
}

export function WorkoutEditor({
  clientId,
  initialData,
  onSuccess,
}: WorkoutEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    descrizione: initialData?.descrizione || "",
    dataScadenza: initialData?.dataScadenza || "",
  });

  const [exercises, setExercises] = useState<Exercise[]>(
    initialData?.exercises || []
  );

  const addExercise = (exercise?: ExerciseTemplate) => {
    const newExercise: Exercise = exercise || {
      nome: "",
      serie: 3,
      ripetizioni: "12",
      peso: "",
      recupero: "60s",
      note: "",
      videoUrl: "",
    };
    setExercises([...exercises, newExercise]);
    setShowLibrary(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === exercises.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...exercises];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id
        ? `/api/workouts/${initialData.id}`
        : "/api/workouts";

      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          ...formData,
          exercises,
          setAsActive: true, // Imposta automaticamente come scheda attiva
        }),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/trainer/clients/${clientId}`);
          router.refresh();
        }
      } else {
        alert("Errore nel salvare la scheda");
      }
    } catch (error) {
      alert("Errore nel salvare la scheda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informazioni Scheda */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Scheda</CardTitle>
          <CardDescription>
            Dettagli principali della scheda di allenamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Scheda *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="es. Scheda Full Body A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataScadenza">Data Scadenza</Label>
              <Input
                id="dataScadenza"
                type="date"
                value={formData.dataScadenza}
                onChange={(e) =>
                  setFormData({ ...formData, dataScadenza: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <textarea
              id="descrizione"
              value={formData.descrizione}
              onChange={(e) =>
                setFormData({ ...formData, descrizione: e.target.value })
              }
              placeholder="es. Programma per principianti - 3 volte a settimana"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Esercizi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Esercizi ({exercises.length})</CardTitle>
              <CardDescription>
                Aggiungi gli esercizi alla scheda
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLibrary(!showLibrary)}
              >
                <Library className="mr-2 h-4 w-4" />
                Libreria
              </Button>
              <Button type="button" onClick={() => addExercise()}>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Esercizio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Libreria Esercizi */}
          {showLibrary && (
            <Card className="bg-secondary/20">
              <CardContent className="pt-6">
                <Tabs defaultValue="petto">
                  <TabsList className="mb-4">
                    {exerciseCategories.map((cat) => (
                      <TabsTrigger key={cat.value} value={cat.value}>
                        {cat.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {exerciseCategories.map((cat) => (
                    <TabsContent key={cat.value} value={cat.value}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {exerciseLibrary
                          .filter((ex) => ex.categoria === cat.value)
                          .map((ex, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => addExercise(ex)}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent text-left"
                            >
                              <div>
                                <p className="font-medium text-sm">{ex.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ex.serie}x{ex.ripetizioni} • {ex.peso || "Corpo libero"}
                                </p>
                              </div>
                              <Plus className="h-4 w-4" />
                            </button>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Lista Esercizi */}
          {exercises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nessun esercizio aggiunto. Usa il pulsante "Nuovo Esercizio" o
              "Libreria" per iniziare.
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1 mt-2">
                        <button
                          type="button"
                          onClick={() => moveExercise(index, "up")}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => moveExercise(index, "down")}
                          disabled={index === exercises.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Ordine */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-2">
                        {index + 1}
                      </div>

                      {/* Campi Esercizio */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-xs">Nome Esercizio</Label>
                          <Input
                            value={exercise.nome}
                            onChange={(e) =>
                              updateExercise(index, "nome", e.target.value)
                            }
                            placeholder="es. Panca piana"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Serie</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={exercise.serie}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                "serie",
                                parseInt(e.target.value) || 3
                              )
                            }
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Ripetizioni</Label>
                          <Input
                            value={exercise.ripetizioni}
                            onChange={(e) =>
                              updateExercise(index, "ripetizioni", e.target.value)
                            }
                            placeholder="12 o 8-12"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Peso</Label>
                          <Input
                            value={exercise.peso || ""}
                            onChange={(e) =>
                              updateExercise(index, "peso", e.target.value)
                            }
                            placeholder="20kg"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Recupero</Label>
                          <Input
                            value={exercise.recupero || ""}
                            onChange={(e) =>
                              updateExercise(index, "recupero", e.target.value)
                            }
                            placeholder="60s"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1">
                          <Label className="text-xs">Note</Label>
                          <Input
                            value={exercise.note || ""}
                            onChange={(e) =>
                              updateExercise(index, "note", e.target.value)
                            }
                            placeholder="Consigli di esecuzione"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-xs">URL Video</Label>
                          <Input
                            value={exercise.videoUrl || ""}
                            onChange={(e) =>
                              updateExercise(index, "videoUrl", e.target.value)
                            }
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-destructive hover:text-destructive/80 mt-2"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Annulla
        </Button>
        <Button type="submit" disabled={loading || exercises.length === 0} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Salvataggio..." : initialData?.id ? "Aggiorna Scheda" : "Crea Scheda"}
        </Button>
      </div>
    </form>
  );
}

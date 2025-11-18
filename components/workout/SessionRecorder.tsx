"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Star } from "lucide-react";

interface Exercise {
  id: string;
  nome: string;
  serie: number;
  ripetizioni: string;
  peso?: string;
  recupero?: string;
  note?: string;
  ordine: number;
}

interface ExerciseData {
  exerciseId: string;
  serieCompletate: number;
  pesoUtilizzato: string;
  note?: string;
}

interface SessionRecorderProps {
  workout: {
    id: string;
    nome: string;
    exercises: Exercise[];
  };
  clientId: string;
}

export function SessionRecorder({ workout, clientId }: SessionRecorderProps) {
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercisesData, setExercisesData] = useState<ExerciseData[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  const [formData, setFormData] = useState<ExerciseData>({
    exerciseId: currentExercise?.id || "",
    serieCompletate: currentExercise?.serie || 0,
    pesoUtilizzato: currentExercise?.peso || "",
    note: "",
  });

  const handleNext = () => {
    setExercisesData([...exercisesData, formData]);

    if (currentExerciseIndex < workout.exercises.length - 1) {
      const nextExercise = workout.exercises[currentExerciseIndex + 1];
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setFormData({
        exerciseId: nextExercise.id,
        serieCompletate: nextExercise.serie,
        pesoUtilizzato: nextExercise.peso || "",
        note: "",
      });
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      const previousExercise = workout.exercises[currentExerciseIndex - 1];
      const previousData = exercisesData[currentExerciseIndex - 1];
      setFormData(previousData);
      setExercisesData(exercisesData.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          workoutId: workout.id,
          exerciseData: exercisesData,
          rating,
          feedback,
          completato: true,
        }),
      });

      if (response.ok) {
        router.push("/client/dashboard");
        router.refresh();
      } else {
        alert("Errore nel salvare la sessione");
      }
    } catch (error) {
      alert("Errore nel salvare la sessione");
    } finally {
      setLoading(false);
    }
  };

  if (showSummary) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle>Allenamento Completato!</CardTitle>
          </div>
          <CardDescription>
            Dai un feedback sulla tua sessione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">
              Come è andata la sessione?
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Note e commenti (opzionale)</Label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Come ti sei sentito durante l'allenamento? Qualche difficoltà?"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">Riepilogo esercizi</h3>
            <div className="space-y-2">
              {workout.exercises.map((exercise, index) => {
                const data = exercisesData[index];
                return (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {exercise.nome}
                    </span>
                    <Badge variant="outline">
                      {data?.serieCompletate} serie • {data?.pesoUtilizzato}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSummary(false);
                setCurrentExerciseIndex(0);
                setExercisesData([]);
              }}
              className="flex-1"
            >
              Modifica
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? "Salvataggio..." : "Salva Sessione"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progressione</span>
              <span className="font-medium">
                {currentExerciseIndex + 1} / {workout.exercises.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {currentExercise.ordine}
            </div>
            <div>
              <CardTitle>{currentExercise.nome}</CardTitle>
              {currentExercise.note && (
                <CardDescription className="mt-1">
                  {currentExercise.note}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Serie consigliate
              </p>
              <p className="text-lg font-semibold">{currentExercise.serie}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ripetizioni</p>
              <p className="text-lg font-semibold">
                {currentExercise.ripetizioni}
              </p>
            </div>
            {currentExercise.peso && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Peso consigliato
                </p>
                <p className="text-lg font-semibold">{currentExercise.peso}</p>
              </div>
            )}
            {currentExercise.recupero && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recupero</p>
                <p className="text-lg font-semibold">
                  {currentExercise.recupero}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Registra i tuoi dati</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serie">Serie completate</Label>
                <Input
                  id="serie"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.serieCompletate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serieCompletate: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso utilizzato</Label>
                <Input
                  id="peso"
                  type="text"
                  placeholder="es. 20kg"
                  value={formData.pesoUtilizzato}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pesoUtilizzato: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-exercise">Note (opzionale)</Label>
              <Input
                id="note-exercise"
                type="text"
                placeholder="Come è andata?"
                value={formData.note || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    note: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {currentExerciseIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                Precedente
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentExerciseIndex === workout.exercises.length - 1
                ? "Completa"
                : "Prossimo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

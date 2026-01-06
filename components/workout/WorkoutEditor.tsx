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
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
  notes?: string;
  videoUrl?: string;
}

interface WorkoutEditorProps {
  clientId: string;
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    expiryDate?: string;
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
    name: initialData?.name || "",
    description: initialData?.description || "",
    expiryDate: initialData?.expiryDate || "",
  });

  const [exercises, setExercises] = useState<Exercise[]>(
    initialData?.exercises || []
  );

  const addExercise = (exercise?: ExerciseTemplate) => {
    const newExercise: Exercise = exercise || {
      name: "",
      sets: 3,
      reps: "12",
      weight: "",
      rest: "60s",
      notes: "",
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
          setAsActive: true, // Automatically set as active card
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
        alert("Error saving workout");
      }
    } catch (error) {
      alert("Error saving workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workout Information */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Information</CardTitle>
          <CardDescription>
            Main details of the workout program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Full Body Workout A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g. Beginner program - 3 times per week"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises ({exercises.length})</CardTitle>
              <CardDescription>
                Add exercises to the workout
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLibrary(!showLibrary)}
              >
                <Library className="mr-2 h-4 w-4" />
                Library
              </Button>
              <Button type="button" onClick={() => addExercise()}>
                <Plus className="mr-2 h-4 w-4" />
                New Exercise
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exercise Library */}
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
                          .filter((ex) => ex.category === cat.value)
                          .map((ex, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => addExercise(ex)}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent text-left"
                            >
                              <div>
                                <p className="font-medium text-sm">{ex.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ex.sets}x{ex.reps} • {ex.weight || "Bodyweight"}
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

          {/* Exercise List */}
          {exercises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No exercises added. Use the &quot;New Exercise&quot; or
              &quot;Library&quot; button to start.
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

                      {/* Order */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-2">
                        {index + 1}
                      </div>

                      {/* Exercise Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-xs">Exercise Name</Label>
                          <Input
                            value={exercise.name}
                            onChange={(e) =>
                              updateExercise(index, "name", e.target.value)
                            }
                            placeholder="e.g. Bench Press"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                "sets",
                                parseInt(e.target.value) || 3
                              )
                            }
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Reps</Label>
                          <Input
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExercise(index, "reps", e.target.value)
                            }
                            placeholder="12 or 8-12"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Weight</Label>
                          <Input
                            value={exercise.weight || ""}
                            onChange={(e) =>
                              updateExercise(index, "weight", e.target.value)
                            }
                            placeholder="20kg"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Rest</Label>
                          <Input
                            value={exercise.rest || ""}
                            onChange={(e) =>
                              updateExercise(index, "rest", e.target.value)
                            }
                            placeholder="60s"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1">
                          <Label className="text-xs">Notes</Label>
                          <Input
                            value={exercise.notes || ""}
                            onChange={(e) =>
                              updateExercise(index, "notes", e.target.value)
                            }
                            placeholder="Execution tips"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-xs">Video URL</Label>
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
          Cancel
        </Button>
        <Button type="submit" disabled={loading || exercises.length === 0} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : initialData?.id ? "Update Workout" : "Create Workout"}
        </Button>
      </div>
    </form>
  );
}

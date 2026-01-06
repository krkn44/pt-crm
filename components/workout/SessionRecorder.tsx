"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Star, Clock, Play, Pause, RotateCcw } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
  rest?: string | null;
  notes?: string | null;
  order: number;
}

interface ExerciseData {
  exerciseId: string;
  setsCompleted: number;
  weightUsed: string;
  notes?: string;
}

interface SessionRecorderProps {
  workout: {
    id: string;
    name: string;
    exercises: Exercise[];
  };
  clientId: string;
}

/**
 * Parses a rest time string and returns seconds.
 * Supports formats like: "60s", "60", "1min", "1m", "90 seconds", "1m30s", "1:30"
 * Returns null if not parseable.
 */
function parseRest(rest: string | null | undefined): number | null {
  if (!rest) return null;

  const str = rest.toLowerCase().trim();

  // Format "1:30" or "01:30"
  const colonMatch = str.match(/^(\d+):(\d+)$/);
  if (colonMatch) {
    const mins = parseInt(colonMatch[1], 10);
    const secs = parseInt(colonMatch[2], 10);
    return mins * 60 + secs;
  }

  // Format "1m30s" or "1min30s" or "1min30sec"
  const mixedMatch = str.match(/^(\d+)\s*(m|min|minutes?)\s*(\d+)?\s*(s|sec|seconds?)?$/);
  if (mixedMatch) {
    const mins = parseInt(mixedMatch[1], 10);
    const secs = mixedMatch[3] ? parseInt(mixedMatch[3], 10) : 0;
    return mins * 60 + secs;
  }

  // Format minutes only: "1min", "2m", "1 minute"
  const minMatch = str.match(/^(\d+)\s*(m|min|minutes?)$/);
  if (minMatch) {
    return parseInt(minMatch[1], 10) * 60;
  }

  // Format seconds only: "60s", "60sec", "60 seconds", "60"
  const secMatch = str.match(/^(\d+)\s*(s|sec|seconds?)?$/);
  if (secMatch) {
    return parseInt(secMatch[1], 10);
  }

  return null;
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

  // Timer state
  const parsedSeconds = parseRest(currentExercise?.rest);
  const hasTimer = parsedSeconds !== null;
  const [timerSeconds, setTimerSeconds] = useState(parsedSeconds ?? 0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [formData, setFormData] = useState<ExerciseData>({
    exerciseId: currentExercise?.id || "",
    setsCompleted: currentExercise?.sets || 0,
    weightUsed: currentExercise?.weight || "",
    notes: "",
  });

  // Reset timer when exercise changes
  useEffect(() => {
    const newParsedSeconds = parseRest(currentExercise?.rest);
    setTimerSeconds(newParsedSeconds ?? 0);
    setIsTimerActive(false);
  }, [currentExerciseIndex, currentExercise?.rest]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
      // Browser notification on completion
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Rest completed!", {
          body: `Ready for the next set of ${currentExercise?.name}`,
          icon: "/icon.png",
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerSeconds, currentExercise?.name]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    const newParsedSeconds = parseRest(currentExercise?.rest);
    setTimerSeconds(newParsedSeconds ?? 0);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    setExercisesData([...exercisesData, formData]);

    if (currentExerciseIndex < workout.exercises.length - 1) {
      const nextExercise = workout.exercises[currentExerciseIndex + 1];
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setFormData({
        exerciseId: nextExercise.id,
        setsCompleted: nextExercise.sets,
        weightUsed: nextExercise.weight || "",
        notes: "",
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
          completed: true,
        }),
      });

      if (response.ok) {
        router.push("/client/workout");
        router.refresh();
      } else {
        alert("Error saving session");
      }
    } catch (error) {
      alert("Error saving session");
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
            <CardTitle>Workout Completed!</CardTitle>
          </div>
          <CardDescription>
            Give feedback on your session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">
              How was your session?
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
            <Label htmlFor="feedback">Notes and comments (optional)</Label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How did you feel during the workout? Any difficulties?"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">Exercise summary</h3>
            <div className="space-y-2">
              {workout.exercises.map((exercise, index) => {
                const data = exercisesData[index];
                return (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {exercise.name}
                    </span>
                    <Badge variant="outline">
                      {data?.setsCompleted} sets • {data?.weightUsed}
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
              Edit
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? "Saving..." : "Save Session"}
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
              <span className="text-muted-foreground">Progress</span>
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
              {currentExercise.order}
            </div>
            <div>
              <CardTitle>{currentExercise.name}</CardTitle>
              {currentExercise.notes && (
                <CardDescription className="mt-1">
                  {currentExercise.notes}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Recommended sets
              </p>
              <p className="text-lg font-semibold">{currentExercise.sets}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reps</p>
              <p className="text-lg font-semibold">
                {currentExercise.reps}
              </p>
            </div>
            {currentExercise.weight && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Recommended weight
                </p>
                <p className="text-lg font-semibold">{currentExercise.weight}</p>
              </div>
            )}
            {currentExercise.rest && !hasTimer && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rest</p>
                <p className="text-lg font-semibold">
                  {currentExercise.rest}
                </p>
              </div>
            )}
          </div>

          {/* Rest timer */}
          {hasTimer && (
            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Rest Timer</p>
                  <p className="text-xs text-muted-foreground">({currentExercise.rest})</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-3xl font-bold ${timerSeconds === 0 ? "text-green-600" : ""}`}>
                  {formatTime(timerSeconds)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={isTimerActive ? "secondary" : "default"}
                    size="icon"
                    onClick={toggleTimer}
                  >
                    {isTimerActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Record your data</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Sets completed</Label>
                <Input
                  id="sets"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.setsCompleted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      setsCompleted: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight used</Label>
                <Input
                  id="weight"
                  type="text"
                  placeholder="e.g. 20kg"
                  value={formData.weightUsed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weightUsed: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes-exercise">Notes (optional)</Label>
              <Input
                id="notes-exercise"
                type="text"
                placeholder="How did it go?"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
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
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentExerciseIndex === workout.exercises.length - 1
                ? "Complete"
                : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

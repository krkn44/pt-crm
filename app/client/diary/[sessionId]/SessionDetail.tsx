"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Dumbbell,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string | null;
  rest: string | null;
  notes: string | null;
  order: number;
}

interface ExerciseData {
  exerciseId: string;
  // New format (sets array)
  sets?: Array<{
    reps: number;
    weight: string;
  }>;
  // Old format (from SessionRecorder)
  serieCompletate?: number;
  pesoUtilizzato?: string;
  note?: string;
}

interface SessionData {
  id: string;
  date: string;
  duration: number | null;
  feedback: string | null;
  rating: number | null;
  completed: boolean;
  exerciseData: ExerciseData[] | null;
  workout: {
    name: string;
    description: string | null;
    exercises: Exercise[];
  };
}

interface SessionDetailProps {
  session: SessionData;
}

export function SessionDetail({ session }: SessionDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(session.feedback || "");
  const [rating, setRating] = useState(session.rating || 0);
  const [error, setError] = useState<string | null>(null);

  const sessionDate = parseISO(session.date);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback || null,
          rating: rating || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save error");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFeedback(session.feedback || "");
    setRating(session.rating || 0);
    setIsEditing(false);
    setError(null);
  };

  // Find recorded data for an exercise
  const getExerciseData = (exerciseId: string): ExerciseData | null => {
    if (!session.exerciseData) return null;
    return session.exerciseData.find((d) => d.exerciseId === exerciseId) || null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/client/diary">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Diary</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </Link>

      {/* Header Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-2xl truncate">{session.workout.name}</CardTitle>
              {session.workout.description && (
                <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                  {session.workout.description}
                </CardDescription>
              )}
            </div>
            {session.completed && (
              <Badge className="w-fit gap-1 shrink-0">
                <Check className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {/* Info grid - 2 columns on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-sm sm:text-base truncate">
                  <span className="sm:hidden">{format(sessionDate, "d MMM yy", { locale: enUS })}</span>
                  <span className="hidden sm:inline">{format(sessionDate, "EEEE d MMMM yyyy", { locale: enUS })}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Time</p>
                <p className="font-medium text-sm sm:text-base">
                  {format(sessionDate, "HH:mm", { locale: enUS })}
                </p>
              </div>
            </div>

            {session.duration && (
              <div className="flex items-center gap-2 sm:gap-3 col-span-2 sm:col-span-1">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium text-sm sm:text-base">{session.duration} min</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback & Rating Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Feedback</CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
          {isEditing ? (
            <>
              {/* Rating Editor */}
              <div className="space-y-2">
                <Label className="text-sm">Rating</Label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 sm:p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 sm:h-8 sm:w-8 transition-colors",
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Editor */}
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm">How did you feel?</Label>
                <Textarea
                  id="feedback"
                  placeholder="Write your feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Rating Display */}
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Rating</p>
                {session.rating ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-5 w-5 sm:h-6 sm:w-6",
                          star <= session.rating!
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No rating
                  </p>
                )}
              </div>

              {/* Feedback Display */}
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Notes</p>
                {session.feedback ? (
                  <p className="text-sm sm:text-base">{session.feedback}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No feedback provided
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Exercises Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Exercises</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {session.workout.exercises.length} exercises in workout
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <Accordion type="multiple" className="w-full">
            {session.workout.exercises.map((exercise, index) => {
              const exerciseData = getExerciseData(exercise.id);

              return (
                <AccordionItem key={exercise.id} value={exercise.id}>
                  <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-left">
                      <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{exercise.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {exercise.sets} x {exercise.reps}
                          {exercise.weight && ` @ ${exercise.weight}`}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 sm:pl-11 space-y-3 sm:space-y-4">
                      {/* Workout Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sets</span>
                          <span>{exercise.sets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reps</span>
                          <span>{exercise.reps}</span>
                        </div>
                        {exercise.weight && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight</span>
                            <span>{exercise.weight}</span>
                          </div>
                        )}
                        {exercise.rest && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rest</span>
                            <span>{exercise.rest}</span>
                          </div>
                        )}
                      </div>

                      {exercise.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes: </span>
                          <span>{exercise.notes}</span>
                        </div>
                      )}

                      {/* Recorded Data */}
                      {exerciseData && (
                        <div className="pt-3 border-t">
                          <p className="font-medium text-sm mb-2">Recorded Data</p>
                          <div className="space-y-2">
                            {/* New format with sets array */}
                            {exerciseData.sets && exerciseData.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm bg-muted/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded"
                              >
                                <span className="font-medium">
                                  S{setIndex + 1}
                                </span>
                                <span>{set.reps} reps</span>
                                <span>{set.weight}</span>
                              </div>
                            ))}
                            {/* Old format from SessionRecorder */}
                            {!exerciseData.sets && (exerciseData.serieCompletate || exerciseData.pesoUtilizzato) && (
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm bg-muted/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">
                                {exerciseData.serieCompletate && (
                                  <span>{exerciseData.serieCompletate} sets</span>
                                )}
                                {exerciseData.pesoUtilizzato && (
                                  <span>@ {exerciseData.pesoUtilizzato}</span>
                                )}
                              </div>
                            )}
                            {exerciseData.note && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                Notes: {exerciseData.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {!exerciseData && (
                        <p className="text-xs sm:text-sm text-muted-foreground italic pt-2 border-t">
                          No data recorded
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

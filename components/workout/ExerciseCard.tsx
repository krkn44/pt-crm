import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Weight } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
  rest?: string | null;
  notes?: string | null;
  videoUrl?: string | null;
  order: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
  showOrder?: boolean;
}

export function ExerciseCard({ exercise, showOrder = true }: ExerciseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showOrder && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {exercise.order}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              {exercise.notes && (
                <CardDescription className="mt-1 text-xs">
                  {exercise.notes}
                </CardDescription>
              )}
            </div>
          </div>
          {exercise.videoUrl && (
            <Badge variant="outline" className="text-xs">
              Video
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Sets x Reps</p>
              <p className="text-sm font-semibold">
                {exercise.sets} x {exercise.reps}
              </p>
            </div>
          </div>

          {exercise.weight && (
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="text-sm font-semibold">{exercise.weight}</p>
              </div>
            </div>
          )}

          {exercise.rest && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rest</p>
                <p className="text-sm font-semibold">{exercise.rest}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

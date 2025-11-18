import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Weight } from "lucide-react";

interface Exercise {
  id: string;
  nome: string;
  serie: number;
  ripetizioni: string;
  peso?: string;
  recupero?: string;
  note?: string;
  videoUrl?: string;
  ordine: number;
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
                {exercise.ordine}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{exercise.nome}</CardTitle>
              {exercise.note && (
                <CardDescription className="mt-1 text-xs">
                  {exercise.note}
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
              <p className="text-xs text-muted-foreground">Serie x Rip</p>
              <p className="text-sm font-semibold">
                {exercise.serie} x {exercise.ripetizioni}
              </p>
            </div>
          </div>

          {exercise.peso && (
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="text-sm font-semibold">{exercise.peso}</p>
              </div>
            </div>
          )}

          {exercise.recupero && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Recupero</p>
                <p className="text-sm font-semibold">{exercise.recupero}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

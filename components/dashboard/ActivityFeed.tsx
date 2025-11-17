import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: "workout" | "measurement" | "appointment" | "checkpoint";
}

interface ActivityFeedProps {
  activities: Activity[];
}

const typeColors = {
  workout: "bg-blue-500",
  measurement: "bg-green-500",
  appointment: "bg-yellow-500",
  checkpoint: "bg-purple-500",
};

const typeLabels = {
  workout: "Allenamento",
  measurement: "Misurazione",
  appointment: "Appuntamento",
  checkpoint: "Checkpoint",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attività Recenti</CardTitle>
        <CardDescription>Le tue ultime attività</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna attività recente
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${
                    typeColors[activity.type]
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[activity.type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                      locale: it,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

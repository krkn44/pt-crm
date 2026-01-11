import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface ClientCardProps {
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone?: string | null;
    clientProfile?: {
      id: string;
      goals?: string | null;
      cardExpiryDate?: Date | null;
    } | null;
    _count?: {
      workoutSessions: number;
      measurements: number;
    };
  };
  lastSession?: Date;
  status?: "active" | "warning" | "inactive";
}

const statusConfig = {
  active: {
    badge: "bg-green-500",
    label: "Active",
  },
  warning: {
    badge: "bg-yellow-500",
    label: "Warning",
  },
  inactive: {
    badge: "bg-red-500",
    label: "Inactive",
  },
};

export function ClientCard({ client, lastSession, status = "active" }: ClientCardProps) {
  const initials = `${client.firstName?.[0] || ""}${client.lastName?.[0] || ""}`.toUpperCase() || "?";
  const config = statusConfig[status];

  const daysToExpiry = client.clientProfile?.cardExpiryDate
    ? Math.ceil(
        (new Date(client.clientProfile.cardExpiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Link href={`/trainer/clients/${client.id}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${config.badge}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {client.email}
                  </p>
                </div>
                <Badge variant="outline" className={`${config.badge} text-white border-none`}>
                  {config.label}
                </Badge>
              </div>

              {client.clientProfile?.goals && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                  {client.clientProfile.goals}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {lastSession && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(lastSession, {
                        addSuffix: true,
                        locale: it,
                      })}
                    </span>
                  </div>
                )}

                {client._count && client._count.workoutSessions > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{client._count.workoutSessions} sessions</span>
                  </div>
                )}

                {daysToExpiry !== null && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span
                      className={
                        daysToExpiry <= 7
                          ? "text-red-600 font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      Card: {daysToExpiry > 0 ? `${daysToExpiry} days` : "Expired"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

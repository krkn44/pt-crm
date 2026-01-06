"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarGrid } from "@/components/diary/CalendarGrid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isSameDay, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { Clock, Star, MessageSquare, ChevronRight, Dumbbell } from "lucide-react";

interface Session {
  id: string;
  date: string;
  workoutName: string;
  rating: number | null;
  feedback: string | null;
  duration: number | null;
  completed: boolean;
}

interface DiaryContentProps {
  sessions: Session[];
}

export function DiaryContent({ sessions }: DiaryContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Extract dates with workouts
  const workoutDates = useMemo(() => {
    return sessions.map((s) => parseISO(s.date));
  }, [sessions]);

  // Filter sessions by selected date or show all
  const filteredSessions = useMemo(() => {
    if (!selectedDate) {
      return sessions;
    }
    return sessions.filter((s) => isSameDay(parseISO(s.date), selectedDate));
  }, [sessions, selectedDate]);

  // Statistics
  const totalSessions = sessions.length;
  const averageRating = useMemo(() => {
    const rated = sessions.filter((s) => s.rating);
    if (rated.length === 0) return null;
    return (
      rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length
    ).toFixed(1);
  }, [sessions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Row - Compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg mb-2 sm:mb-0">
                <Dumbbell className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalSessions}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg mb-2 sm:mb-0">
                <Star className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {averageRating ? `${averageRating}` : "N/A"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Rating
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg mb-2 sm:mb-0">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {sessions.length > 0 &&
                  sessions.some((s) => s.duration)
                    ? `${Math.round(
                        sessions
                          .filter((s) => s.duration)
                          .reduce((sum, s) => sum + (s.duration || 0), 0) /
                          sessions.filter((s) => s.duration).length
                      )}`
                    : "N/A"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Min avg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[350px_1fr]">
        {/* Calendar */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Calendar</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Click on a day to filter
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <CalendarGrid
              workoutDates={workoutDates}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                // If clicking on same date, deselect
                if (selectedDate && isSameDay(date, selectedDate)) {
                  setSelectedDate(null);
                } else {
                  setSelectedDate(date);
                }
              }}
            />
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setSelectedDate(null)}
              >
                Show all
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Session List */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              {selectedDate
                ? `${format(selectedDate, "d MMM yyyy", { locale: enUS })}`
                : "All Sessions"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {filteredSessions.length === 0
                ? "No sessions found"
                : `${filteredSessions.length} session${
                    filteredSessions.length === 1 ? "" : "s"
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {filteredSessions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <Dumbbell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  {selectedDate
                    ? "No workouts on this date"
                    : "No workouts recorded yet"}
                </p>
                <Link href="/client/session/new" className="mt-4">
                  <Button size="sm">Record Workout</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  const sessionDate = parseISO(session.date);

  return (
    <Link href={`/client/diary/${session.id}`}>
      <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm sm:text-base truncate">{session.workoutName}</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {format(sessionDate, "EEE d MMM 'at' HH:mm", {
              locale: enUS,
            })}
          </p>
          {/* Feedback visible only on larger screens */}
          {session.feedback && (
            <div className="hidden sm:flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span className="truncate">{session.feedback}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
          {/* Rating always visible */}
          {session.rating && (
            <Badge className="text-xs px-1.5 sm:px-2">
              <Star className="h-3 w-3 mr-0.5 sm:mr-1 fill-current" />
              {session.rating}
            </Badge>
          )}
          {/* Duration only on tablet+ */}
          {session.duration && (
            <Badge variant="outline" className="hidden sm:flex text-xs">
              {session.duration}m
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </Link>
  );
}

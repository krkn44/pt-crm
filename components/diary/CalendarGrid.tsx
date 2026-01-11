"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  workoutDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({
  workoutDates,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const hasWorkout = (date: Date) => {
    return workoutDates.some((d) => isSameDay(d, date));
  };

  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  return (
    <div className="w-full">
      {/* Header con navigazione */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: it })}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Griglia dei giorni */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasWorkoutOnDay = hasWorkout(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "relative aspect-square p-1 text-sm rounded-md transition-colors",
                "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                !isCurrentMonth && "text-muted-foreground/30 cursor-not-allowed",
                isCurrentMonth && "cursor-pointer",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                isToday && !isSelected && "border border-primary",
                hasWorkoutOnDay && !isSelected && "font-bold"
              )}
            >
              <span className="flex flex-col items-center justify-center h-full">
                {format(day, "d")}
                {hasWorkoutOnDay && (
                  <span
                    className={cn(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-green-500"
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Giorno di allenamento</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border border-primary rounded" />
          <span>Oggi</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";

interface RestTimerProps {
  defaultSeconds?: number;
}

export function RestTimer({ defaultSeconds = 60 }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isActive, setIsActive] = useState(false);
  const [initialSeconds] = useState(defaultSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Riproduci suono o notifica
      if (typeof window !== "undefined" && "Notification" in window) {
        new Notification("Recupero completato!", {
          body: "È ora di iniziare la prossima serie",
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-sm font-medium opacity-90">Timer Recupero</div>
          <div className="text-5xl font-bold tabular-nums">
            {formatTime(seconds)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggle}
              className="h-12 w-12"
            >
              {isActive ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="h-12 w-12"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

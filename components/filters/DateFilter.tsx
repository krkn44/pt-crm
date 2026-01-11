"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DateFilterProps {
  showPresets?: boolean;
}

export function DateFilter({ showPresets = true }: DateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const updateFilters = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (from) {
      params.set("dateFrom", from);
    } else {
      params.delete("dateFrom");
    }

    if (to) {
      params.set("dateTo", to);
    } else {
      params.delete("dateTo");
    }

    params.delete("page"); // Reset page quando si cambia filtro
    router.push(`?${params.toString()}`);
  };

  const setPreset = (preset: "week" | "month" | "all") => {
    const today = new Date();
    let from = "";
    let to = format(today, "yyyy-MM-dd");

    switch (preset) {
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        from = format(weekAgo, "yyyy-MM-dd");
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        from = format(monthAgo, "yyyy-MM-dd");
        break;
      case "all":
        from = "";
        to = "";
        break;
    }

    updateFilters(from, to);
  };

  const clearFilters = () => {
    updateFilters("", "");
  };

  const hasActiveFilters = dateFrom || dateTo;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Da
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilters(e.target.value, dateTo)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">A</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => updateFilters(dateFrom, e.target.value)}
              />
            </div>
          </div>

          {showPresets && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset("week")}
              >
                Ultima settimana
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset("month")}
              >
                Ultimo mese
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset("all")}
              >
                Tutti
              </Button>
            </div>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Rimuovi filtri
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

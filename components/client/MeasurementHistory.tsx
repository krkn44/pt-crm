"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Measurement {
  id: string;
  date: string;
  weight: number | null;
  bodyFatPercentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  notes: string | null;
}

interface MeasurementHistoryProps {
  measurements: Measurement[];
}

export function MeasurementHistory({ measurements }: MeasurementHistoryProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/measurements/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Error deleting measurement");
      }
    } catch {
      alert("Error deleting measurement");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (measurements.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-6">
        No measurements recorded
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {measurements.map((measurement) => (
          <div
            key={measurement.id}
            className="p-3 sm:p-4 border rounded-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm sm:text-base">
                {format(new Date(measurement.date), "dd MMM yyyy")}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/client/progress/${measurement.id}/edit`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteId(measurement.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {measurement.weight && (
                <div>
                  <span className="text-muted-foreground">Weight: </span>
                  <span className="font-medium">{measurement.weight} kg</span>
                </div>
              )}
              {measurement.bodyFatPercentage && (
                <div>
                  <span className="text-muted-foreground">Body Fat: </span>
                  <span className="font-medium">{measurement.bodyFatPercentage}%</span>
                </div>
              )}
              {measurement.chest && (
                <div>
                  <span className="text-muted-foreground">Chest: </span>
                  <span className="font-medium">{measurement.chest} cm</span>
                </div>
              )}
              {measurement.waist && (
                <div>
                  <span className="text-muted-foreground">Waist: </span>
                  <span className="font-medium">{measurement.waist} cm</span>
                </div>
              )}
            </div>
            {measurement.notes && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {measurement.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Measurement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this measurement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

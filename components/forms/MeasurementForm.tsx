"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

interface MeasurementData {
  date: string;
  weight: string;
  chest: string;
  shoulders: string;
  waist: string;
  hips: string;
  bicepRelaxed: string;
  bicepContracted: string;
  quadRelaxed: string;
  quadContracted: string;
  calfContracted: string;
  bodyFatPercentage: string;
  notes: string;
}

interface MeasurementFormProps {
  clientId: string;
  redirectUrl?: string;
  measurementId?: string; // If provided, we're in edit mode
  initialData?: Partial<MeasurementData>;
}

export function MeasurementForm({ clientId, redirectUrl, measurementId, initialData }: MeasurementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!measurementId;

  const [formData, setFormData] = useState<MeasurementData>({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    weight: initialData?.weight || "",
    chest: initialData?.chest || "",
    shoulders: initialData?.shoulders || "",
    waist: initialData?.waist || "",
    hips: initialData?.hips || "",
    bicepRelaxed: initialData?.bicepRelaxed || "",
    bicepContracted: initialData?.bicepContracted || "",
    quadRelaxed: initialData?.quadRelaxed || "",
    quadContracted: initialData?.quadContracted || "",
    calfContracted: initialData?.calfContracted || "",
    bodyFatPercentage: initialData?.bodyFatPercentage || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode
        ? `/api/measurements/${measurementId}`
        : "/api/measurements";

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          ...formData,
        }),
      });

      if (response.ok) {
        router.push(redirectUrl || "/client/progress");
        router.refresh();
      } else {
        alert(isEditMode ? "Error updating measurement" : "Error saving measurement");
      }
    } catch {
      alert(isEditMode ? "Error updating measurement" : "Error saving measurement");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Body Measurements</CardTitle>
          <CardDescription>
            Enter your measurements. All fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="base" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="base">Basic Data</TabsTrigger>
              <TabsTrigger value="circumferences">Circumferences</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Measurement Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify when the measurement was taken
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    placeholder="75.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFatPercentage">Body Fat %</Label>
                  <Input
                    id="bodyFatPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.bodyFatPercentage}
                    onChange={(e) =>
                      updateField("bodyFatPercentage", e.target.value)
                    }
                    placeholder="15.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional - only enter if obtained from professional measurement
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="circumferences" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                Measure the weak side for arms and legs
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.chest}
                    onChange={(e) => updateField("chest", e.target.value)}
                    placeholder="95"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shoulders">Shoulders (cm)</Label>
                  <Input
                    id="shoulders"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.shoulders}
                    onChange={(e) => updateField("shoulders", e.target.value)}
                    placeholder="110"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.waist}
                    onChange={(e) => updateField("waist", e.target.value)}
                    placeholder="85"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.hips}
                    onChange={(e) => updateField("hips", e.target.value)}
                    placeholder="98"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bicepRelaxed">Bicep Relaxed (cm)</Label>
                  <Input
                    id="bicepRelaxed"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.bicepRelaxed}
                    onChange={(e) => updateField("bicepRelaxed", e.target.value)}
                    placeholder="32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bicepContracted">Bicep Contracted (cm)</Label>
                  <Input
                    id="bicepContracted"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.bicepContracted}
                    onChange={(e) => updateField("bicepContracted", e.target.value)}
                    placeholder="35"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quadRelaxed">Quadriceps Relaxed (cm)</Label>
                  <Input
                    id="quadRelaxed"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.quadRelaxed}
                    onChange={(e) => updateField("quadRelaxed", e.target.value)}
                    placeholder="56"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quadContracted">Quadriceps Contracted (cm)</Label>
                  <Input
                    id="quadContracted"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.quadContracted}
                    onChange={(e) => updateField("quadContracted", e.target.value)}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calfContracted">Calf Contracted (cm)</Label>
                  <Input
                    id="calfContracted"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.calfContracted}
                    onChange={(e) => updateField("calfContracted", e.target.value)}
                    placeholder="38"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Add any notes about the measurement..."
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : isEditMode ? "Update Measurement" : "Save Measurement"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

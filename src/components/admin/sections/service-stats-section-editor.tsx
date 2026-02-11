"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  statisticItemSchema,
  sectionStylingSchema,
} from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

const serviceStatsSectionSchema = z.object({
  enabled: z.boolean(),
  statistics: z.array(statisticItemSchema),
  styling: sectionStylingSchema,
});

type ServiceStatsSectionFormData = z.infer<typeof serviceStatsSectionSchema>;

interface ServiceStatsSectionEditorProps {
  data: ServiceStatsSectionFormData;
  onChange: (data: ServiceStatsSectionFormData) => void;
  onSave?: () => void;
}

export function ServiceStatsSectionEditor({
  data,
  onChange,
  onSave,
}: ServiceStatsSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ServiceStatsSectionFormData>({
    resolver: zodResolver(serviceStatsSectionSchema),
    defaultValues: {
      ...data,
      statistics: data.statistics || [],
    },
    mode: "onChange",
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "statistics",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: ServiceStatsSectionFormData) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      onChange(formData);
      if (onSave) {
        await Promise.resolve(onSave());
      }
    } catch (error) {
      console.error("Failed to save section:", error);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  // const addStatistic = () => {
  //   append({ number: "100+", label: "New Statistic" });
  // };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Statistics Configuration</CardTitle>
          <CardDescription>
            Configure statistics that appear across service sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={data.enabled}
              onCheckedChange={(checked) => {
                onChange({
                  ...data,
                  enabled: checked,
                });
              }}
            />
            <Label htmlFor="enabled">Enable service statistics</Label>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              About Service Statistics
            </h4>
            <p className="text-sm text-blue-800">
              These statistics will be displayed in service sections that have
              &quot;showStats&quot; enabled. They provide consistent data across all
              service pages.
            </p>
          </div>
        </CardContent>
      </Card>

      {data.enabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>
                  Add and manage service statistics
                </CardDescription>
              </div>
              {/* <Button type="button" onClick={addStatistic}>
                <Plus className="h-4 w-4 mr-2" />
                Add Statistic
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end space-x-4 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`statistics.${index}.number`}>Number *</Label>
                  <Input
                    id={`statistics.${index}.number`}
                    placeholder="12"
                    {...form.register(`statistics.${index}.number`)}
                  />
                  {form.formState.errors.statistics?.[index]?.number && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.statistics[index]?.number?.message}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor={`statistics.${index}.label`}>Label *</Label>
                  <Input
                    id={`statistics.${index}.label`}
                    placeholder="Professional providers"
                    {...form.register(`statistics.${index}.label`)}
                  />
                  {form.formState.errors.statistics?.[index]?.label && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.statistics[index]?.label?.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No statistics added yet</p>
                {/* <Button type="button" onClick={addStatistic}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Statistic
                </Button> */}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Section Styling</CardTitle>
            <CardDescription>
              Customize the appearance of the statistics section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorPickerInput
                label="Background Color"
                value={normalizeColorValue(data.styling.backgroundColor)}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      backgroundColor: value,
                    },
                  });
                }}
                supportGradient={true}
                gradientDirection={data.styling.gradientDirection || "to-r"}
              />

              <ColorPickerInput
                label="Text Color"
                value={normalizeColorValue(data.styling.textColor)}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      textColor: typeof value === "string" ? value : value[0],
                    },
                  });
                }}
                supportGradient={false}
              />

              <div className="space-y-2">
                <Label htmlFor="padding">Padding</Label>
                <Select
                  value={data.styling.padding || "py-6"}
                  onValueChange={(value) => {
                    onChange({
                      ...data,
                      styling: {
                        ...data.styling,
                        padding: value,
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="py-4">Small</SelectItem>
                    <SelectItem value="py-6">Medium</SelectItem>
                    <SelectItem value="py-8">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Section"}
        </Button>
      </div>
    </form>
  );
}

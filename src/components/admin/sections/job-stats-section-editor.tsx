"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { z } from "zod";
import { sectionStylingSchema } from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

const jobStatsSectionSchema = z.object({
  enabled: z.boolean(),
  showOpenPositions: z.boolean(),
  showRemoteOptions: z.boolean(),
  styling: sectionStylingSchema,
});

type JobStatsSectionFormData = z.infer<typeof jobStatsSectionSchema>;

interface JobStatsSectionEditorProps {
  data: JobStatsSectionFormData;
  onChange: (data: JobStatsSectionFormData) => void;
  onSave?: () => void;
}

export function JobStatsSectionEditor({
  data,
  onChange,
  onSave,
}: JobStatsSectionEditorProps) {
  const form = useForm<JobStatsSectionFormData>({
    resolver: zodResolver(jobStatsSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: JobStatsSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Statistics Configuration</CardTitle>
          <CardDescription>
            Configure what job statistics to display in the hero section
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
            <Label htmlFor="enabled">Enable job statistics section</Label>
          </div>

          {data.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showOpenPositions"
                  checked={data.showOpenPositions}
                  onCheckedChange={(checked) => {
                    onChange({
                      ...data,
                      showOpenPositions: checked,
                    });
                  }}
                />
                <Label htmlFor="showOpenPositions">
                  Show open positions count
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showRemoteOptions"
                  checked={data.showRemoteOptions}
                  onCheckedChange={(checked) => {
                    onChange({
                      ...data,
                      showRemoteOptions: checked,
                    });
                  }}
                />
                <Label htmlFor="showRemoteOptions">
                  Show remote & hybrid options
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data.enabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Section Styling</CardTitle>
              <CardDescription>
                Customize the appearance of the job statistics section
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
                    value={data.styling.padding || "py-8"}
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
                      <SelectItem value="py-8">Medium</SelectItem>
                      <SelectItem value="py-12">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Icon Card Styling</CardTitle>
              <CardDescription>
                Customize the appearance of the statistic icon containers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPickerInput
                  label="Icon Background Color"
                  value={normalizeColorValue(
                    data.styling.cardStyle?.backgroundColor
                  )}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      styling: {
                        ...data.styling,
                        cardStyle: {
                          ...data.styling.cardStyle,
                          backgroundColor: value,
                        },
                      },
                    });
                  }}
                  supportGradient={true}
                />

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Select
                    value={
                      data.styling.cardStyle?.borderRadius || "rounded-full"
                    }
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        styling: {
                          ...data.styling,
                          cardStyle: {
                            ...data.styling.cardStyle,
                            borderRadius: value,
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded-none">None</SelectItem>
                      <SelectItem value="rounded-sm">Small</SelectItem>
                      <SelectItem value="rounded-md">Medium</SelectItem>
                      <SelectItem value="rounded-lg">Large</SelectItem>
                      <SelectItem value="rounded-full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardPadding">Icon Padding</Label>
                  <Select
                    value={data.styling.cardStyle?.padding || "p-3"}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        styling: {
                          ...data.styling,
                          cardStyle: {
                            ...data.styling.cardStyle,
                            padding: value,
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p-2">Small</SelectItem>
                      <SelectItem value="p-3">Medium</SelectItem>
                      <SelectItem value="p-4">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Section
        </Button>
      </div>
    </form>
  );
}

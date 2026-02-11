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
import { Save } from "lucide-react";
import { z } from "zod";
import { sectionStylingSchema } from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

const departmentFiltersSectionSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  showJobCounts: z.boolean(),
  styling: sectionStylingSchema,
});

type DepartmentFiltersSectionFormData = z.infer<
  typeof departmentFiltersSectionSchema
>;

interface DepartmentFiltersSectionEditorProps {
  data: DepartmentFiltersSectionFormData;
  onChange: (data: DepartmentFiltersSectionFormData) => void;
  onSave?: () => void;
}

export function DepartmentFiltersSectionEditor({
  data,
  onChange,
  onSave,
}: DepartmentFiltersSectionEditorProps) {
  const form = useForm<DepartmentFiltersSectionFormData>({
    resolver: zodResolver(departmentFiltersSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: DepartmentFiltersSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Filters Configuration</CardTitle>
          <CardDescription>
            Configure the department filter section in the jobs page
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
            <Label htmlFor="enabled">Enable department filters</Label>
          </div>

          {data.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title *</Label>
                <Input
                  id="title"
                  placeholder="Filter by Department"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showJobCounts"
                  checked={data.showJobCounts}
                  onCheckedChange={(checked) => {
                    onChange({
                      ...data,
                      showJobCounts: checked,
                    });
                  }}
                />
                <Label htmlFor="showJobCounts">
                  Show job counts on filter buttons
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
                Customize the appearance of the department filters section
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
                    value={data.styling.padding || "py-4"}
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
                      <SelectItem value="py-2">Small</SelectItem>
                      <SelectItem value="py-4">Medium</SelectItem>
                      <SelectItem value="py-6">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter Button Styling</CardTitle>
              <CardDescription>
                Customize the appearance of the department filter buttons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonSize">Button Size</Label>
                  <Select
                    value={data.styling.buttonStyle?.size || "sm"}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        styling: {
                          ...data.styling,
                          buttonStyle: {
                            ...data.styling.buttonStyle,
                            size: value,
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonVariant">Button Variant</Label>
                  <Select
                    value={data.styling.buttonStyle?.variant || "outline"}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        styling: {
                          ...data.styling,
                          buttonStyle: {
                            ...data.styling.buttonStyle,
                            variant: value,
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ColorPickerInput
                  label="Active Button Background"
                  value={normalizeColorValue(
                    data.styling.buttonStyle?.activeBackgroundColor
                  )}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      styling: {
                        ...data.styling,
                        buttonStyle: {
                          ...data.styling.buttonStyle,
                          activeBackgroundColor: value,
                        },
                      },
                    });
                  }}
                  supportGradient={true}
                />

                <ColorPickerInput
                  label="Active Button Text Color"
                  value={normalizeColorValue(
                    data.styling.buttonStyle?.activeTextColor
                  )}
                  onChange={(value) => {
                    onChange({
                      ...data,
                      styling: {
                        ...data.styling,
                        buttonStyle: {
                          ...data.styling.buttonStyle,
                          activeTextColor:
                            typeof value === "string" ? value : value[0],
                        },
                      },
                    });
                  }}
                  supportGradient={false}
                />
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

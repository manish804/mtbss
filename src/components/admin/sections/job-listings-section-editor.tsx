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
import { Textarea } from "@/components/ui/textarea";
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

const jobListingsSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  showDepartmentBadges: z.boolean(),
  showLocationInfo: z.boolean(),
  showSalaryRange: z.boolean(),
  styling: sectionStylingSchema,
});

type JobListingsSectionFormData = z.infer<typeof jobListingsSectionSchema>;

interface JobListingsSectionEditorProps {
  data: JobListingsSectionFormData;
  onChange: (data: JobListingsSectionFormData) => void;
  onSave?: () => void;
}

export function JobListingsSectionEditor({
  data,
  onChange,
  onSave,
}: JobListingsSectionEditorProps) {
  const form = useForm<JobListingsSectionFormData>({
    resolver: zodResolver(jobListingsSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: JobListingsSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Listings Content</CardTitle>
          <CardDescription>
            Configure the content and display options for the job listings
            section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Section Title *</Label>
              <Input
                id="title"
                placeholder="Available Positions"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Section Subtitle</Label>
              <Textarea
                id="subtitle"
                placeholder="Explore our current job openings and find your next career opportunity"
                rows={2}
                {...form.register("subtitle")}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Display Options</h4>

            <div className="flex items-center space-x-2">
              <Switch
                id="showDepartmentBadges"
                checked={data.showDepartmentBadges}
                onCheckedChange={(checked) => {
                  onChange({
                    ...data,
                    showDepartmentBadges: checked,
                  });
                }}
              />
              <Label htmlFor="showDepartmentBadges">
                Show department badges on job cards
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showLocationInfo"
                checked={data.showLocationInfo}
                onCheckedChange={(checked) => {
                  onChange({
                    ...data,
                    showLocationInfo: checked,
                  });
                }}
              />
              <Label htmlFor="showLocationInfo">
                Show location information
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showSalaryRange"
                checked={data.showSalaryRange}
                onCheckedChange={(checked) => {
                  onChange({
                    ...data,
                    showSalaryRange: checked,
                  });
                }}
              />
              <Label htmlFor="showSalaryRange">
                Show salary range (when available)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the job listings section
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
                value={data.styling.padding || "py-12 md:py-16"}
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
                  <SelectItem value="py-8 md:py-12">Small</SelectItem>
                  <SelectItem value="py-12 md:py-16">Medium</SelectItem>
                  <SelectItem value="py-16 md:py-20">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Card Styling</CardTitle>
          <CardDescription>
            Customize the appearance of individual job listing cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorPickerInput
              label="Card Background Color"
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

            <ColorPickerInput
              label="Hover Background Color"
              value={normalizeColorValue(
                data.styling.cardStyle?.hoverBackgroundColor
              )}
              onChange={(value) => {
                onChange({
                  ...data,
                  styling: {
                    ...data.styling,
                    cardStyle: {
                      ...data.styling.cardStyle,
                      hoverBackgroundColor: value,
                    },
                  },
                });
              }}
              supportGradient={true}
            />

            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Select
                value={data.styling.cardStyle?.borderRadius || "rounded-lg"}
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
                  <SelectItem value="rounded-xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardPadding">Card Padding</Label>
              <Select
                value={data.styling.cardStyle?.padding || "p-6"}
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
                  <SelectItem value="p-4">Small</SelectItem>
                  <SelectItem value="p-6">Medium</SelectItem>
                  <SelectItem value="p-8">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadowColor">Shadow</Label>
              <Select
                value={data.styling.cardStyle?.shadowColor || "shadow-sm"}
                onValueChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        shadowColor: value,
                      },
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shadow-none">None</SelectItem>
                  <SelectItem value="shadow-sm">Small</SelectItem>
                  <SelectItem value="shadow-md">Medium</SelectItem>
                  <SelectItem value="shadow-lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoverShadowColor">Hover Shadow</Label>
              <Select
                value={
                  data.styling.cardStyle?.hoverShadowColor || "hover:shadow-md"
                }
                onValueChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        hoverShadowColor: value,
                      },
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hover:shadow-sm">Small</SelectItem>
                  <SelectItem value="hover:shadow-md">Medium</SelectItem>
                  <SelectItem value="hover:shadow-lg">Large</SelectItem>
                  <SelectItem value="hover:shadow-xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Section
        </Button>
      </div>
    </form>
  );
}

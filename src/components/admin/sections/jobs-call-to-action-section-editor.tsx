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

const jobsCallToActionSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  styling: sectionStylingSchema,
});

type JobsCallToActionSectionFormData = z.infer<
  typeof jobsCallToActionSectionSchema
>;

interface JobsCallToActionSectionEditorProps {
  data: JobsCallToActionSectionFormData;
  onChange: (data: JobsCallToActionSectionFormData) => void;
  onSave?: () => void;
}

export function JobsCallToActionSectionEditor({
  data,
  onChange,
  onSave,
}: JobsCallToActionSectionEditorProps) {
  const form = useForm<JobsCallToActionSectionFormData>({
    resolver: zodResolver(jobsCallToActionSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: JobsCallToActionSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Call to Action Content</CardTitle>
          <CardDescription>
            Configure the call-to-action section content for the jobs page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-[#ffe9f0]">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Ready to Join Our Team?"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              placeholder="Don't see a position that fits? We're always looking for talented individuals."
              rows={2}
              {...form.register("subtitle")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Primary Button Text</Label>
              <Input
                id="ctaText"
                placeholder="Contact Us"
                {...form.register("ctaText")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Primary Button Link</Label>
              <Input
                id="ctaLink"
                placeholder="/contact"
                {...form.register("ctaLink")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secondaryCtaText">Secondary Button Text</Label>
              <Input
                id="secondaryCtaText"
                placeholder="View All Benefits"
                {...form.register("secondaryCtaText")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryCtaLink">Secondary Button Link</Label>
              <Input
                id="secondaryCtaLink"
                placeholder="#benefits"
                {...form.register("secondaryCtaLink")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the call-to-action section
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
                value={data.styling.padding || "py-16 md:py-20"}
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
                  <SelectItem value="py-12 md:py-16">Small</SelectItem>
                  <SelectItem value="py-16 md:py-20">Medium</SelectItem>
                  <SelectItem value="py-20 md:py-24">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {Array.isArray(data.styling.backgroundColor) && (
            <div className="space-y-2">
              <Label htmlFor="gradientDirection">Gradient Direction</Label>
              <Select
                value={data.styling.gradientDirection || "to-r"}
                onValueChange={(value: "to-r" | "to-b" | "to-br" | "to-bl") => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      gradientDirection: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-r">Left to Right</SelectItem>
                  <SelectItem value="to-b">Top to Bottom</SelectItem>
                  <SelectItem value="to-br">
                    Top-Left to Bottom-Right
                  </SelectItem>
                  <SelectItem value="to-bl">
                    Top-Right to Bottom-Left
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the call-to-action buttons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorPickerInput
              label="Primary Button Background"
              value={normalizeColorValue(
                data.styling.buttonStyle?.backgroundColor
              )}
              onChange={(value) => {
                onChange({
                  ...data,
                  styling: {
                    ...data.styling,
                    buttonStyle: {
                      ...data.styling.buttonStyle,
                      backgroundColor: value,
                    },
                  },
                });
              }}
              supportGradient={true}
            />

            <ColorPickerInput
              label="Primary Button Text Color"
              value={normalizeColorValue(data.styling.buttonStyle?.textColor)}
              onChange={(value) => {
                onChange({
                  ...data,
                  styling: {
                    ...data.styling,
                    buttonStyle: {
                      ...data.styling.buttonStyle,
                      textColor: typeof value === "string" ? value : value[0],
                    },
                  },
                });
              }}
              supportGradient={false}
            />

            <ColorPickerInput
              label="Hover Background Color"
              value={normalizeColorValue(
                data.styling.buttonStyle?.hoverBackgroundColor
              )}
              onChange={(value) => {
                onChange({
                  ...data,
                  styling: {
                    ...data.styling,
                    buttonStyle: {
                      ...data.styling.buttonStyle,
                      hoverBackgroundColor: value,
                    },
                  },
                });
              }}
              supportGradient={true}
            />

            <div className="space-y-2">
              <Label htmlFor="buttonSize">Button Size</Label>
              <Select
                value={data.styling.buttonStyle?.size || "lg"}
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
                value={data.styling.buttonStyle?.variant || "secondary"}
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
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
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

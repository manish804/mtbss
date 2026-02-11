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

const benefitsSectionSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  subtitle: z.string().optional(),
  showCompanyCulture: z.boolean(),
  styling: sectionStylingSchema,
});

type BenefitsSectionFormData = z.infer<typeof benefitsSectionSchema>;

interface BenefitsSectionEditorProps {
  data: BenefitsSectionFormData;
  onChange: (data: BenefitsSectionFormData) => void;
  onSave?: () => void;
}

export function BenefitsSectionEditor({
  data,
  onChange,
  onSave,
}: BenefitsSectionEditorProps) {
  const form = useForm<BenefitsSectionFormData>({
    resolver: zodResolver(benefitsSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: BenefitsSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Benefits Section Configuration</CardTitle>
          <CardDescription>
            Configure the benefits and company culture section
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
            <Label htmlFor="enabled">Enable benefits section</Label>
          </div>

          {data.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title *</Label>
                <Input
                  id="title"
                  placeholder="Why Work With Us"
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
                  placeholder="We offer comprehensive benefits and a supportive work environment"
                  rows={2}
                  {...form.register("subtitle")}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showCompanyCulture"
                  checked={data.showCompanyCulture}
                  onCheckedChange={(checked) => {
                    onChange({
                      ...data,
                      showCompanyCulture: checked,
                    });
                  }}
                />
                <Label htmlFor="showCompanyCulture">
                  Show company culture section
                </Label>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  About Benefits Data
                </h4>
                <p className="text-sm text-blue-800">
                  This section will automatically display benefits and company
                  culture information from your global content data. The actual
                  benefits and culture items are managed separately in your
                  content database.
                </p>
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
                Customize the appearance of the benefits section
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefit Card Styling</CardTitle>
              <CardDescription>
                Customize the appearance of individual benefit cards
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

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Select
                    value={data.styling.cardStyle?.borderRadius || "rounded-xl"}
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

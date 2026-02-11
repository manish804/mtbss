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

const formSectionSchema = z.object({
  title: z.string(),
  styling: sectionStylingSchema,
});

type FormSectionFormData = z.infer<typeof formSectionSchema>;

interface FormSectionEditorProps {
  data: FormSectionFormData;
  onChange: (data: FormSectionFormData) => void;
  onSave?: () => void;
}

export function FormSectionEditor({
  data,
  onChange,
  onSave,
}: FormSectionEditorProps) {
  const form = useForm<FormSectionFormData>({
    resolver: zodResolver(formSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: FormSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Content</CardTitle>
          <CardDescription>Configure the contact form section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title *</Label>
            <Input
              id="title"
              placeholder="Tell us your details and we'll get right back to you."
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the form section
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
                value={data.styling.padding || "py-12 px-4"}
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
                  <SelectItem value="py-8 px-4">Small</SelectItem>
                  <SelectItem value="py-12 px-4">Medium</SelectItem>
                  <SelectItem value="py-16 px-4">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Card Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the form card
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Button Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the form submit button
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorPickerInput
              label="Button Background Color"
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
              label="Button Text Color"
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
                value={data.styling.buttonStyle?.variant || "primary"}
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
                  <SelectItem value="primary">Primary</SelectItem>
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

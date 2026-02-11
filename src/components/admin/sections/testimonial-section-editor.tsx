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

const testimonialSectionSchema = z.object({
  enabled: z.boolean(),
  styling: sectionStylingSchema,
});

type TestimonialSectionFormData = z.infer<typeof testimonialSectionSchema>;

interface TestimonialSectionEditorProps {
  data: TestimonialSectionFormData;
  onChange: (data: TestimonialSectionFormData) => void;
  onSave?: () => void;
}

export function TestimonialSectionEditor({
  data,
  onChange,
  onSave,
}: TestimonialSectionEditorProps) {
  const form = useForm<TestimonialSectionFormData>({
    resolver: zodResolver(testimonialSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: TestimonialSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Testimonial Section</CardTitle>
          <CardDescription>
            Configure whether to show testimonials on this page
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
            <Label htmlFor="enabled">Enable testimonials section</Label>
          </div>
          <p className="text-sm text-gray-600">
            When enabled, this will display testimonials from your global
            testimonials collection
          </p>
        </CardContent>
      </Card>

      {data.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Section Styling</CardTitle>
            <CardDescription>
              Customize the appearance of the testimonials section
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
                  value={data.styling.padding || "py-16 px-4"}
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
                    <SelectItem value="py-20 px-4">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                About Testimonials
              </h4>
              <p className="text-sm text-blue-800">
                This section will automatically display testimonials from your
                global testimonials collection. The actual testimonial content
                is managed separately in your testimonials database.
              </p>
            </div>
          </CardContent>
        </Card>
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

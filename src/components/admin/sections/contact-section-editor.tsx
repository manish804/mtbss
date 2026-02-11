"use client";

import React, { useState } from "react";
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
import { Save, Loader2 } from "lucide-react";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";
import { z } from "zod";
import { sectionStylingSchema } from "@/lib/validation/page-schemas";

const contactSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  styling: sectionStylingSchema,
});

type ContactSectionFormData = z.infer<typeof contactSectionSchema>;

interface ContactSectionEditorProps {
  data: ContactSectionFormData;
  onChange: (data: ContactSectionFormData) => void;
  onSave?: () => void;
}

export function ContactSectionEditor({
  data,
  onChange,
  onSave,
}: ContactSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ContactSectionFormData>({
    resolver: zodResolver(contactSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: ContactSectionFormData) => {
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Section</CardTitle>
          <CardDescription>
            Configure the contact section content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter section title..."
              {...form.register("title")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              placeholder="Enter subtitle..."
              rows={2}
              {...form.register("subtitle")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the contact section
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
                value={data.styling.padding || "py-12 md:py-24 lg:py-32"}
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
                  <SelectItem value="py-12 md:py-24 lg:py-32">Medium</SelectItem>
                  <SelectItem value="py-16 px-4">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

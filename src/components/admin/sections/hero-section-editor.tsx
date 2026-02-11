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
import { heroSectionSchema } from "@/lib/validation/page-schemas";
import { Save, X } from "lucide-react";
import { z } from "zod";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

type HeroSectionFormData = z.infer<typeof heroSectionSchema>;

interface HeroSectionEditorProps {
  data: HeroSectionFormData;
  onChange: (data: HeroSectionFormData) => void;
  onSave?: () => void;
}

export function HeroSectionEditor({
  data,
  onChange,
  onSave,
}: HeroSectionEditorProps) {
  const form = useForm<HeroSectionFormData>({
    resolver: zodResolver(heroSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: HeroSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Content</CardTitle>
          <CardDescription>Main content for the hero section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter hero title..."
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
              <Input
                id="subtitle"
                placeholder="Enter subtitle..."
                {...form.register("subtitle")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter hero description..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                placeholder="Get Started"
                {...form.register("ctaText")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                placeholder="/contact"
                {...form.register("ctaLink")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background Image</CardTitle>
          <CardDescription>
            Set the background image for the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.backgroundImage && (
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.backgroundImage.imageUrl}
                alt={data.backgroundImage.description}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">
                  {data.backgroundImage.description}
                </p>
                <p className="text-sm text-gray-500">
                  {data.backgroundImage.imageUrl}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const nextData = { ...data };
                  delete nextData.backgroundImage;
                  onChange(nextData);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={data.backgroundImage?.imageUrl || ""}
                onChange={(e) => {
                  const imageUrl = e.target.value;
                  if (imageUrl) {
                    onChange({
                      ...data,
                      backgroundImage: {
                        id: data.backgroundImage?.id || "hero-bg",
                        description:
                          data.backgroundImage?.description ||
                          "Hero background",
                        imageUrl,
                        imageHint:
                          data.backgroundImage?.imageHint || "hero background",
                      },
                    });
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageDescription">Image Description</Label>
              <Input
                id="imageDescription"
                placeholder="Describe the image..."
                value={data.backgroundImage?.description || ""}
                onChange={(e) => {
                  if (data.backgroundImage) {
                    onChange({
                      ...data,
                      backgroundImage: {
                        ...data.backgroundImage,
                        description: e.target.value,
                      },
                    });
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the hero section
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
                value={data.styling.padding || "py-20 px-4"}
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
                  <SelectItem value="py-12 px-4">Small</SelectItem>
                  <SelectItem value="py-20 px-4">Medium</SelectItem>
                  <SelectItem value="py-32 px-4">Large</SelectItem>
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

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Section
        </Button>
      </div>
    </form>
  );
}

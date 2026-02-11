"use client";

import React, { useState } from "react";
import {
  useForm,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Trash2, MoveUp, MoveDown, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  imageDataSchema,
  sectionStylingSchema,
} from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

const serviceItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  image: imageDataSchema,
  layout: z.string(),
  showStats: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

const serviceDetailsSectionSchema = z.object({
  services: z.array(serviceItemSchema),
  styling: sectionStylingSchema,
});

type ServiceDetailsSectionFormData = z.infer<
  typeof serviceDetailsSectionSchema
>;

interface ServiceDetailsSectionEditorProps {
  data: ServiceDetailsSectionFormData;
  onChange: (data: ServiceDetailsSectionFormData) => void;
  onSave?: () => void;
}

export function ServiceDetailsSectionEditor({
  data,
  onChange,
  onSave,
}: ServiceDetailsSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ServiceDetailsSectionFormData>({
    resolver: zodResolver(serviceDetailsSectionSchema),
    defaultValues: {
      services: data.services || [],
      styling: data.styling || {
        backgroundColor: "bg-background",
        textColor: "text-foreground",
        padding: "py-10 md:py-12",
        cardStyle: {
          backgroundColor: "bg-card",
          padding: "p-8",
          borderRadius: "rounded-lg",
          shadowColor: "shadow-2xl",
        },
      },
    },
    mode: "onChange",
  });

  const { fields, remove, move } = useFieldArray({
    control: form.control,
    name: "services",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: ServiceDetailsSectionFormData) => {
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Configure individual service sections with detailed information1234
              </CardDescription>
            </div>
            {/* <Button type="button" onClick={addService}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-6 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Service {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => move(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      move(index, Math.min(fields.length - 1, index + 1))
                    }
                    disabled={index === fields.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`services.${index}.id`}>Service ID *</Label>
                  <Input
                    id={`services.${index}.id`}
                    placeholder="accounting"
                    {...form.register(`services.${index}.id`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`services.${index}.category`}>
                    Category *
                  </Label>
                  <Input
                    id={`services.${index}.category`}
                    placeholder="ACCOUNTING"
                    {...form.register(`services.${index}.category`)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`services.${index}.title`}>Title *</Label>
                <Input
                  id={`services.${index}.title`}
                  placeholder="Full-service accounting for your business."
                  {...form.register(`services.${index}.title`)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`services.${index}.description`}>
                  Description *
                </Label>
                <Textarea
                  id={`services.${index}.description`}
                  placeholder="Detailed description of the service..."
                  rows={4}
                  {...form.register(`services.${index}.description`)}
                />
              </div>

              <ServiceFeaturesEditor serviceIndex={index} form={form} />

              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium">Service Image</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`services.${index}.image.id`}>
                      Image ID
                    </Label>
                    <Input
                      id={`services.${index}.image.id`}
                      placeholder="service-accounting-team"
                      {...form.register(`services.${index}.image.id`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`services.${index}.image.imageUrl`}>
                      Image URL
                    </Label>
                    <Input
                      id={`services.${index}.image.imageUrl`}
                      placeholder="https://picsum.photos/seed/accounting/600/800"
                      {...form.register(`services.${index}.image.imageUrl`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`services.${index}.image.description`}>
                      Image Description
                    </Label>
                    <Input
                      id={`services.${index}.image.description`}
                      placeholder="Professional accounting team working"
                      {...form.register(`services.${index}.image.description`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`services.${index}.image.imageHint`}>
                      Image Hint
                    </Label>
                    <Input
                      id={`services.${index}.image.imageHint`}
                      placeholder="accounting team financial documents"
                      {...form.register(`services.${index}.image.imageHint`)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`services.${index}.layout`}>Layout</Label>
                  <Select
                    value={
                      form.watch(`services.${index}.layout`) ||
                      "text-left-image-right"
                    }
                    onValueChange={(value) => {
                      form.setValue(`services.${index}.layout`, value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-left-image-right">
                        Text Left, Image Right
                      </SelectItem>
                      <SelectItem value="image-left-text-right">
                        Image Left, Text Right
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium">Display Options</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`services.${index}.showStats`}
                      checked={
                        form.watch(`services.${index}.showStats`) || false
                      }
                      onCheckedChange={(checked) => {
                        form.setValue(`services.${index}.showStats`, checked);
                      }}
                    />
                    <Label htmlFor={`services.${index}.showStats`}>
                      Show statistics
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`services.${index}.showCta`}
                      checked={form.watch(`services.${index}.showCta`) || false}
                      onCheckedChange={(checked) => {
                        form.setValue(`services.${index}.showCta`, checked);
                      }}
                    />
                    <Label htmlFor={`services.${index}.showCta`}>
                      Show call-to-action button
                    </Label>
                  </div>

                  {form.watch(`services.${index}.showCta`) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor={`services.${index}.ctaText`}>
                          CTA Text
                        </Label>
                        <Input
                          id={`services.${index}.ctaText`}
                          placeholder="Contact us"
                          {...form.register(`services.${index}.ctaText`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`services.${index}.ctaLink`}>
                          CTA Link
                        </Label>
                        <Input
                          id={`services.${index}.ctaLink`}
                          placeholder="/contact"
                          {...form.register(`services.${index}.ctaLink`)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No services added yet</p>
              {/* <Button type="button" onClick={addService}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Service
              </Button> */}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the service details section
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
                value={data.styling.padding || "py-10 md:py-12"}
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
                  <SelectItem value="py-8 md:py-10">Small</SelectItem>
                  <SelectItem value="py-10 md:py-12">Medium</SelectItem>
                  <SelectItem value="py-12 md:py-16">Large</SelectItem>
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


function ServiceFeaturesEditor({
  serviceIndex,
  form,
}: {
  serviceIndex: number;
  form: {
    register: UseFormRegister<ServiceDetailsSectionFormData>;
    watch: UseFormWatch<ServiceDetailsSectionFormData>;
    setValue: UseFormSetValue<ServiceDetailsSectionFormData>;
  };
}) {
  const features = form.watch(`services.${serviceIndex}.features`) || [];

  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h5 className="font-medium">Service Features</h5>
        {/* <Button
          type="button"
          size="sm"
          onClick={() => append("")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button> */}
      </div>

      {features.map((_, featureIndex) => (
        <div key={`${serviceIndex}-${featureIndex}`} className="flex items-center space-x-2">
          <Input
            placeholder="Financial Statement Preparation"
            {...form.register(
              `services.${serviceIndex}.features.${featureIndex}`
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const nextFeatures = features.filter(
                (_feature, index) => index !== featureIndex
              );
              form.setValue(
                `services.${serviceIndex}.features`,
                nextFeatures
              );
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {features.length === 0 && (
        <p className="text-sm text-gray-500">No features added yet</p>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Save, Trash2 } from "lucide-react";
import { z } from "zod";
import { businessHourSchema } from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";

const contactInfoSectionSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  businessHours: z.array(businessHourSchema),
});

type ContactInfoSectionFormData = z.infer<typeof contactInfoSectionSchema>;

interface ContactInfoSectionEditorProps {
  data: ContactInfoSectionFormData;
  onChange: (data: ContactInfoSectionFormData) => void;
  onSave?: () => void;
}

export function ContactInfoSectionEditor({
  data,
  onChange,
  onSave,
}: ContactInfoSectionEditorProps) {
  const form = useForm<ContactInfoSectionFormData>({
    resolver: zodResolver(contactInfoSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "businessHours",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = (formData: ContactInfoSectionFormData) => {
    onChange(formData);
    onSave?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Basic contact details for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="(555) 555-5555"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State, ZIP"
              {...form.register("address")}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-600">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your operating hours for different days
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end space-x-4 p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor={`businessHours.${index}.days`}>Days</Label>
                <Input
                  id={`businessHours.${index}.days`}
                  placeholder="Mon - Fri"
                  {...form.register(`businessHours.${index}.days`)}
                />
                {form.formState.errors.businessHours?.[index]?.days && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.businessHours[index]?.days?.message}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor={`businessHours.${index}.hours`}>Hours</Label>
                <Input
                  id={`businessHours.${index}.hours`}
                  placeholder="9:00 am - 5:00 pm"
                  {...form.register(`businessHours.${index}.hours`)}
                />
                {form.formState.errors.businessHours?.[index]?.hours && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.businessHours[index]?.hours?.message}
                  </p>
                )}
              </div>

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
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No business hours added yet</p>
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

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
import { Save, X, Plus, Edit2 } from "lucide-react";
import { z } from "zod";
import { useFormSync } from "@/hooks/use-form-sync";
import { imageDataSchema } from "@/lib/validation/page-schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const teamImagesSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  teamImages: z.array(imageDataSchema),
  styling: z.object({
    padding: z.string().optional(),
    textColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    buttonStyle: z
      .object({
        size: z.string().optional(),
        variant: z.string().optional(),
        textColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        hoverBackgroundColor: z.string().optional(),
      })
      .optional(),
  }),
});

type TeamImagesSectionFormData = z.infer<typeof teamImagesSectionSchema>;
type TeamImage = z.infer<typeof imageDataSchema>;

interface TeamImagesSectionEditorProps {
  data: TeamImagesSectionFormData;
  onChange: (data: TeamImagesSectionFormData) => void;
  onSave?: () => void;
}

interface TeamImageItemProps {
  image: TeamImage;
  onEdit: (image: TeamImage) => void;
  onDelete: (id: string) => void;
}

function TeamImageItem({ image, onEdit, onDelete }: TeamImageItemProps) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.imageUrl}
        alt={image.description}
        className="w-16 h-16 object-cover rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "https://via.placeholder.com/64x64?text=Error";
        }}
      />

      <div className="flex-1">
        <p className="font-medium">{image.description}</p>
        <p className="text-sm text-gray-500 truncate">{image.imageUrl}</p>
        <p className="text-xs text-gray-400">{image.imageHint}</p>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEdit(image)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onDelete(image.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface TeamImageEditDialogProps {
  image: TeamImage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (image: TeamImage) => void;
}

function TeamImageEditDialog({
  image,
  isOpen,
  onClose,
  onSave,
}: TeamImageEditDialogProps) {
  const [formData, setFormData] = useState<TeamImage>(
    image || {
      id: "",
      imageUrl: "",
      imageHint: "",
      description: "",
    }
  );

  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    if (image) {
      setFormData(image);
    } else {
      setFormData({
        id: `team-member-${Date.now()}`,
        imageUrl: "",
        imageHint: "",
        description: "",
      });
    }
    setImageError(false);
  }, [image, isOpen]);

  const handleSave = () => {
    if (!formData.imageUrl || !formData.description) {
      return;
    }
    onSave(formData);
    onClose();
  };

  const validateImageUrl = (url: string) => {
    if (!url) {
      setImageError(false);
      return;
    }

    const img = new Image();
    img.onload = () => setImageError(false);
    img.onerror = () => setImageError(true);
    img.src = url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {image ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {image
              ? "Update the team member information."
              : "Add a new team member image."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => {
                const url = e.target.value;
                setFormData({ ...formData, imageUrl: url });
                validateImageUrl(url);
              }}
            />
            {imageError && (
              <p className="text-sm text-red-600">
                Invalid image URL or image failed to load
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Professional team member in business attire"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageHint">Image Hint</Label>
            <Textarea
              id="imageHint"
              placeholder="professional business person portrait"
              rows={2}
              value={formData.imageHint}
              onChange={(e) =>
                setFormData({ ...formData, imageHint: e.target.value })
              }
            />
          </div>

          {formData.imageUrl && !imageError && (
            <div className="space-y-2">
              <Label>Preview</Label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.imageUrl}
                alt={formData.description}
                className="w-32 h-32 object-cover rounded border"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!formData.imageUrl || !formData.description || imageError}
          >
            {image ? "Update" : "Add"} Team Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeamImagesSectionEditor({
  data,
  onChange,
  onSave,
}: TeamImagesSectionEditorProps) {
  const [editingImage, setEditingImage] = useState<TeamImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<TeamImagesSectionFormData>({
    resolver: zodResolver(teamImagesSectionSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const handleAddImage = () => {
    setEditingImage(null);
    setIsDialogOpen(true);
  };

  const handleEditImage = (image: TeamImage) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  const handleDeleteImage = (id: string) => {
    const newTeamImages = data.teamImages.filter((img) => img.id !== id);
    onChange({
      ...data,
      teamImages: newTeamImages,
    });
  };

  const handleSaveImage = (image: TeamImage) => {
    if (editingImage) {
      const newTeamImages = data.teamImages.map((img) =>
        img.id === editingImage.id ? image : img
      );
      onChange({
        ...data,
        teamImages: newTeamImages,
      });
    } else {
      onChange({
        ...data,
        teamImages: [...data.teamImages, image],
      });
    }
  };

  const onSubmit = async (formData: TeamImagesSectionFormData) => {
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
          <CardTitle>Team Section Content</CardTitle>
          <CardDescription>Main content for the team section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter team section title..."
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
              placeholder="Enter subtitle..."
              rows={2}
              {...form.register("subtitle")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                placeholder="Contact us"
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Member Images</CardTitle>
              <CardDescription>Manage team member images</CardDescription>
            </div>
            <Button type="button" onClick={handleAddImage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.teamImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No team members added yet.</p>
              <Button type="button" onClick={handleAddImage}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.teamImages.map((image) => (
                <TeamImageItem
                  key={image.id}
                  image={image}
                  onEdit={handleEditImage}
                  onDelete={handleDeleteImage}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the team section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                placeholder="#ffffff"
                value={data.styling?.backgroundColor || ""}
                onChange={(e) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      backgroundColor: e.target.value,
                    },
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Input
                id="textColor"
                placeholder="#000000"
                value={data.styling?.textColor || ""}
                onChange={(e) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      textColor: e.target.value,
                    },
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                placeholder="py-10 md:py-12"
                value={data.styling?.padding || ""}
                onChange={(e) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      padding: e.target.value,
                    },
                  });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Save className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Section"}
        </Button>
      </div>

      <TeamImageEditDialog
        image={editingImage}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveImage}
      />
    </form>
  );
}

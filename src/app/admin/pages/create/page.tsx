"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const createPageFormSchema = z.object({
  pageId: z
    .string()
    .min(1, "Page ID is required")
    .max(100, "Page ID must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Page ID can only contain lowercase letters, numbers, and hyphens"
    ),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  isPublished: z.boolean().default(false),
});

type CreatePageFormData = z.infer<typeof createPageFormSchema>;

export default function CreatePagePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreatePageFormData>({
    resolver: zodResolver(createPageFormSchema),
    defaultValues: {
      pageId: "",
      title: "",
      description: "",
      isPublished: false,
    },
  });

  const onSubmit = async (data: CreatePageFormData) => {
    setIsSubmitting(true);

    try {
      const pageContent = {
        pageId: data.pageId,
        title: data.title,
        description: data.description,
        lastModified: new Date().toISOString(),
        published: data.isPublished,
      };

      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: data.pageId,
          title: data.title,
          description: data.description,
          content: pageContent,
          isPublished: data.isPublished,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create page");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Page created successfully",
      });

      router.push(`/admin/pages/${result.data.id}`);
    } catch (error) {
      console.error("Error creating page:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create page",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePageId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);

    const currentPageId = form.getValues("pageId");
    if (
      !currentPageId ||
      currentPageId === generatePageId(form.getValues("title"))
    ) {
      form.setValue("pageId", generatePageId(title));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/pages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Page</h1>
          <p className="text-gray-600 mt-1">
            Set up the basic information for your new page
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Page Information</CardTitle>
                <CardDescription>
                  Basic information about your page. You can add content
                  sections after creating the page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter page title..."
                    {...form.register("title")}
                    onChange={handleTitleChange}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageId">Page ID (URL) *</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">/</span>
                    <Input
                      id="pageId"
                      placeholder="page-url"
                      {...form.register("pageId")}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This will be the URL path for your page. Use lowercase
                    letters, numbers, and hyphens only.
                  </p>
                  {form.formState.errors.pageId && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.pageId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a brief description of this page..."
                    rows={3}
                    {...form.register("description")}
                  />
                  <p className="text-xs text-gray-500">
                    This description will be used for SEO and internal
                    organization.
                  </p>
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
                <CardDescription>
                  Control when this page goes live
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="isPublished">Publish immediately</Label>
                    <p className="text-xs text-gray-500">
                      Make this page visible on the website
                    </p>
                  </div>
                  <Switch id="isPublished" {...form.register("isPublished")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Page"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/admin/pages">Cancel</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>After creating your page, you&apos;ll be able to:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Add content sections (Hero, About, etc.)</li>
                    <li>Customize styling and layout</li>
                    <li>Upload and manage images</li>
                    <li>Preview your changes</li>
                    <li>Publish when ready</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

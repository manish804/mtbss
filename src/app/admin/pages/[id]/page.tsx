"use client";

import { useEffect, useState, use, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SectionEditor } from "@/components/admin/section-editor";
import {
  ArrowLeft,
  Save,
  Settings,
  FileText,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import type { PageData, PageContent } from "@/lib/types/page";

const pageMetadataSchema = z.object({
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
  isPublished: z.boolean(),
});

type PageMetadataFormData = z.infer<typeof pageMetadataSchema>;

interface EditPagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPagePage({ params }: EditPagePageProps) {
  const resolvedParams = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const { toast } = useToast();

  const form = useForm<PageMetadataFormData>({
    resolver: zodResolver(pageMetadataSchema),
    defaultValues: {
      pageId: "",
      title: "",
      description: "",
      isPublished: false,
    },
  });

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${resolvedParams.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch page");
      }

      const result = await response.json();
      const pageData = result.data;

      setPage(pageData);

      form.reset({
        pageId: pageData.pageId,
        title: pageData.title,
        description: pageData.description,
        isPublished: pageData.isPublished,
      });
    } catch (error) {
      console.error("Error fetching page:", error);
      toast({
        title: "Error",
        description: "Failed to load page data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [form, resolvedParams.id, toast]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  const savePageMetadata = async (data: PageMetadataFormData) => {
    if (!page) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/pages/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update page");
      }

      const result = await response.json();
      setPage(result.data);

      toast({
        title: "Success",
        description: "Page metadata updated successfully",
      });
    } catch (error) {
      console.error("Error updating page:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update page",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePageContent = async (content: PageContent) => {
    if (!page) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/pages/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            ...content,
            lastModified: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update page content");
      }

      const result = await response.json();
      setPage(result.data);

      toast({
        title: "Success",
        description: "Page content saved successfully",
      });
    } catch (error) {
      console.error("Error updating page content:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update page content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (content: PageContent) => {
    if (page) {
      setPage({
        ...page,
        content,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/pages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              <Badge variant={page.isPublished ? "default" : "secondary"}>
                {page.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">/{page.pageId}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {page.isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${page.pageId}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => savePageContent(page.content)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Created {new Date(page.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Updated {new Date(page.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <span>ID: {page.id}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <SectionEditor
            content={page.content}
            onChange={handleContentChange}
            onSave={() => savePageContent(page.content)}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <form
            onSubmit={form.handleSubmit(savePageMetadata)}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
                <CardDescription>
                  Basic page information and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter page title..."
                      {...form.register("title")}
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
                    {form.formState.errors.pageId && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.pageId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter page description..."
                    rows={3}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isPublished">Publication Status</Label>
                    <p className="text-sm text-gray-500">
                      Control whether this page is visible on the website
                    </p>
                  </div>
                  <Switch id="isPublished" {...form.register("isPublished")} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

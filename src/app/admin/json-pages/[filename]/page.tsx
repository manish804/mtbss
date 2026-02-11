"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionEditor } from "@/components/admin/section-editor";
import type { PageContent } from "@/lib/types/page";

// Lazy load the header component for better performance
import { PageHeader } from "./components/page-header";

interface EditJsonPageProps {
  params: Promise<{
    filename: string;
  }>;
}

export default function EditJsonPage({ params }: EditJsonPageProps) {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const resolvedParams = use(params);
  const filename = resolvedParams.filename.endsWith(".json")
    ? resolvedParams.filename
    : `${resolvedParams.filename}.json`;

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/json-pages/${filename}`);

      if (!response.ok) {
        throw new Error("Failed to fetch page");
      }

      const result = await response.json();
      setPage(result.data);
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
  }, [filename, toast]);

  const savePageContent = useCallback(async (content?: PageContent) => {
    const contentToSave = content || page;
    if (!contentToSave) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/json-pages/${filename}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update page");
      }

      if (!content) {
        // Only update state if called from header save button
        setPage(contentToSave);
      }

      toast({
        title: "Success",
        description: "Page saved successfully",
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
  }, [page, filename, toast]);

  const handleContentChange = useCallback((content: PageContent) => {
    setPage(content);
  }, []);

  const handleSaveFromHeader = useCallback(() => {
    if (page) {
      savePageContent(page);
    }
  }, [page, savePageContent]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Loading state
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

  // Not found state
  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page file you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/json-pages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <PageHeader
        page={{
          title: page.title,
          pageId: page.pageId,
          published: page.published,
        }}
        saving={saving}
        onSave={handleSaveFromHeader}
      />

      <div className="w-full">
        <SectionEditor
          content={page}
          onChange={handleContentChange}
          onSave={savePageContent}
        />
      </div>
    </div>
  );
}

"use client";

import { memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Save, Loader2 } from "lucide-react";

interface PageHeaderProps {
  page: {
    title: string;
    pageId: string;
    published: boolean;
  };
  saving: boolean;
  onSave: () => void;
}

export const PageHeader = memo(function PageHeader({
  page,
  saving,
  onSave,
}: PageHeaderProps) {
  return (
    <div className="w-full flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-fit flex-shrink-0"
        >
          <Link href="/admin/json-pages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words min-w-0">
              {page.title}
            </h1>
            <Badge
              variant={page.published ? "default" : "secondary"}
              className="w-fit flex-shrink-0"
            >
              {page.published ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {page.published && (
          <>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href={`/${page.pageId}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="sm:hidden">
              <Link href={`/${page.pageId}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="flex-shrink-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          <span className="hidden sm:inline">Save Changes</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>
    </div>
  );
});
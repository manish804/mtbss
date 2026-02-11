"use client";

import { memo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface RecentPage {
  id: string;
  pageId: string;
  title: string;
  isPublished: boolean;
  updatedAt: string;
}

interface RecentPagesProps {
  pages: RecentPage[];
  loading: boolean;
}

export const RecentPages = memo(function RecentPages({
  pages,
  loading,
}: RecentPagesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Pages</CardTitle>
          <CardDescription>Recently updated pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Pages</CardTitle>
        <CardDescription>Recently updated pages</CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length > 0 ? (
          <div className="space-y-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {page.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    /{page.pageId}
                  </p>
                  <p className="text-xs text-gray-400">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0">
                  <Badge
                    variant={page.isPublished ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {page.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/json-pages/${page.id}`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pages found</p>
            <Button asChild className="mt-4">
              <Link href="/admin/json-pages">View Available Pages</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
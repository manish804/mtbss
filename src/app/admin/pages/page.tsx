"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Edit,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { PageData } from "@/lib/types/page";

interface PaginatedPages {
  data: PageData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PagesListPage() {
  const [pages, setPages] = useState<PaginatedPages | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (publishedFilter !== "all")
        params.append("published", publishedFilter);

      const response = await fetch(`/api/pages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, publishedFilter]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const togglePublished = async (pageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error("Failed to update page status:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/pages?${params}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/admin/pages?${params}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">
            Manage your website pages and content
          </p>
        </div>
        {/* <Button asChild>
          <Link href="/admin/pages/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Link>
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {pages ? `${pages.pagination.total} Pages` : "Loading..."}
            </CardTitle>
            {pages && pages.pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {pages.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pages.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : pages && pages.data.length > 0 ? (
            <div className="space-y-4">
              {pages.data.map((page) => (
                <div
                  key={page.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{page.title}</h3>
                        <Badge
                          variant={page.isPublished ? "default" : "secondary"}
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mt-1">{page.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>ID: /{page.pageId}</span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Updated{" "}
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                        <Switch
                          checked={page.isPublished}
                          onCheckedChange={() =>
                            togglePublished(page.id, page.isPublished)
                          }
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/pages/${page.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        {page.isPublished && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/${page.pageId}`} target="_blank">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Eye className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pages found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || publishedFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first page"}
              </p>
              {/* <Button asChild>
                <Link href="/admin/pages/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Link>
              </Button> */}
            </div>
          )}
        </CardContent>
      </Card>

      {pages && pages.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {pages.pagination.totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pages.pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pages.pagination.totalPages)}
              disabled={currentPage >= pages.pagination.totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

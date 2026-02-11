"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SectionStatusIndicator } from "@/components/admin/navigation/section-status-indicator";
import {
  Edit,
  Calendar,
  Search,
  FileText,
  ExternalLink,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import type { JsonPageInfo } from "@/lib/services/json-page-service";

export default function JsonPagesListPage() {
  const [pages, setPages] = useState<JsonPageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/json-pages");
      if (response.ok) {
        const data = await response.json();
        setPages(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/json-content">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Overview</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {" "}
            Page Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Edit individual website pages and their content
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link href="/admin/json-content">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Content Overview
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Search Pages</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">
              {loading
                ? "Loading..."
                : `${filteredPages.length} Pages Available`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredPages.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredPages.map((page) => (
                <div
                  key={page.filename}
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {page.title}
                        </h3>
                        <Badge
                          variant={page.published ? "default" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {page.published ? "Published" : "Draft"}
                        </Badge>
                        <SectionStatusIndicator
                          status={
                            page.validationStatus ||
                            (page.published ? "complete" : "incomplete")
                          }
                          showIcon={false}
                          className="scale-75 shrink-0"
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs mb-2 inline-block"
                      >
                        {page.filename}
                      </Badge>
                      <p className="text-gray-600 text-sm mb-2">
                        {page.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="truncate">ID: /{page.id}</span>
                        <span className="flex items-center shrink-0">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Updated{" "}
                          {new Date(page.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start space-x-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex-1 sm:flex-none"
                      >
                        <Link
                          href={`/admin/json-pages/${page.filename.replace(
                            ".json",
                            ""
                          )}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      {page.published && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1 sm:flex-none"
                        >
                          <Link href={`/${page.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No pages found" : "No pages available"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No JSON page files found in the pages directory"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import type {
  PageData,
  CreatePageRequest,
  UpdatePageRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/types/page";

/**
 * API client for page management
 */
export class PageApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all pages with optional filtering and pagination
   */
  async getPages(
    options: {
      page?: number;
      limit?: number;
      published?: boolean;
      search?: string;
    } = {}
  ): Promise<PaginatedResponse<PageData>> {
    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (typeof options.published === "boolean")
      params.append("published", options.published.toString());
    if (options.search) params.append("search", options.search);

    const response = await fetch(`${this.baseUrl}/pages?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a single page by ID
   */
  async getPage(id: string): Promise<ApiResponse<PageData>> {
    const response = await fetch(`${this.baseUrl}/pages/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new page
   */
  async createPage(data: CreatePageRequest): Promise<ApiResponse<PageData>> {
    const response = await fetch(`${this.baseUrl}/pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create page");
    }

    return response.json();
  }

  /**
   * Update a page (full update)
   */
  async updatePage(
    id: string,
    data: UpdatePageRequest
  ): Promise<ApiResponse<PageData>> {
    const response = await fetch(`${this.baseUrl}/pages/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update page");
    }

    return response.json();
  }

  /**
   * Patch a page (partial update)
   */
  async patchPage(
    id: string,
    data: Partial<UpdatePageRequest>
  ): Promise<ApiResponse<PageData>> {
    const response = await fetch(`${this.baseUrl}/pages/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to patch page");
    }

    return response.json();
  }

  /**
   * Get page statistics
   */
  async getPageStats(): Promise<
    ApiResponse<{ total: number; published: number; unpublished: number }>
  > {
    const response = await fetch(`${this.baseUrl}/pages/stats`);

    if (!response.ok) {
      throw new Error(`Failed to fetch page stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Toggle page publication status
   */
  async togglePublished(
    id: string,
    isPublished: boolean
  ): Promise<ApiResponse<PageData>> {
    return this.patchPage(id, { isPublished });
  }

  /**
   * Duplicate a page
   */
  async duplicatePage(
    id: string,
    newPageId: string,
    newTitle: string
  ): Promise<ApiResponse<PageData>> {
    const pageResponse = await this.getPage(id);

    if (!pageResponse.success || !pageResponse.data) {
      throw new Error("Failed to fetch original page");
    }

    const originalPage = pageResponse.data;

    const duplicateData: CreatePageRequest = {
      pageId: newPageId,
      title: newTitle,
      description: `Copy of ${originalPage.description}`,
      content: {
        ...originalPage.content,
        pageId: newPageId,
        title: newTitle,
        lastModified: new Date().toISOString(),
      },
      isPublished: false,
    };

    return this.createPage(duplicateData);
  }
}

export const pageApi = new PageApiClient();

/**
 * React hook for API operations with loading states
 */
export function usePageApi() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const execute = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
    clearError: () => setError(null),
  };
}

import React from "react";

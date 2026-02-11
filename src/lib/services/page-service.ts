import { prisma } from "@/lib/prisma";
import type { Page as PrismaPage, Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors/api-error";
import type {
  PageData,
  CreatePageRequest,
  UpdatePageRequest,
  PageContent,
} from "@/lib/types/page";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class PageService {
  /**
   * Create a new page
   */
  static async createPage(data: CreatePageRequest): Promise<PageData> {
    try {
      const existingPage = await prisma.page.findUnique({
        where: { pageId: data.pageId },
      });

      if (existingPage) {
        throw new ApiError(`Page with ID '${data.pageId}' already exists`, 409);
      }

      const now = new Date();

      const page = await prisma.page.create({
        data: {
          pageId: data.pageId,
          title: data.title,
          description: data.description,
          lastModified: now,
          isPublished: data.isPublished || false,
          content: data.content as unknown as Prisma.InputJsonValue,
        },
      });

      return this.transformPageData(page);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to create page", 500, {
        originalError: error,
      });
    }
  }

  /**
   * Get all pages with pagination and filtering
   */
  static async getPages(
    options: {
      page?: number;
      limit?: number;
      published?: boolean;
      search?: string;
    } = {}
  ) {
    try {
      const { page = 1, limit = 10, published, search } = options;
      const skip = (page - 1) * limit;

      const where: Prisma.PageWhereInput = {};

      if (typeof published === "boolean") {
        where.isPublished = published;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { pageId: { contains: search, mode: "insensitive" } },
        ];
      }

      const [pages, total] = await Promise.all([
        prisma.page.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.page.count({ where }),
      ]);

      const transformedPages = pages.map((page) =>
        this.transformPageData(page)
      );

      return {
        data: transformedPages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApiError("Failed to fetch pages", 500, {
        originalError: error,
      });
    }
  }

  /**
   * Get a single page by ID
   */
  static async getPageById(id: string): Promise<PageData> {
    try {
      const page = await prisma.page.findUnique({
        where: { id },
      });

      if (!page) {
        throw new ApiError(`Page with ID '${id}' not found`, 404);
      }

      return this.transformPageData(page);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to fetch page", 500, { originalError: error });
    }
  }

  /**
   * Get a single page by pageId
   */
  static async getPageByPageId(pageId: string): Promise<PageData> {
    try {
      const page = await prisma.page.findUnique({
        where: { pageId },
      });

      if (!page) {
        throw new ApiError(`Page with pageId '${pageId}' not found`, 404);
      }

      return this.transformPageData(page);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to fetch page", 500, { originalError: error });
    }
  }

  /**
   * Update a page (full update)
   */
  static async updatePage(
    id: string,
    data: UpdatePageRequest
  ): Promise<PageData> {
    try {
      const existingPage = await prisma.page.findUnique({
        where: { id },
      });

      if (!existingPage) {
        throw new ApiError(`Page with ID '${id}' not found`, 404);
      }

      if (data.pageId && data.pageId !== existingPage.pageId) {
        const conflictingPage = await prisma.page.findUnique({
          where: { pageId: data.pageId },
        });

        if (conflictingPage) {
          throw new ApiError(
            `Page with pageId '${data.pageId}' already exists`,
            409
          );
        }
      }

      const updateData: Prisma.PageUpdateInput = {
        lastModified: new Date(),
      };

      if (data.pageId) updateData.pageId = data.pageId;
      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (typeof data.isPublished === "boolean")
        updateData.isPublished = data.isPublished;
      if (data.content)
        updateData.content = data.content as unknown as Prisma.InputJsonValue;

      const page = await prisma.page.update({
        where: { id },
        data: updateData,
      });

      return this.transformPageData(page);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to update page", 500, {
        originalError: error,
      });
    }
  }

  /**
   * Patch a page (partial update)
   */
  static async patchPage(
    id: string,
    data: Partial<UpdatePageRequest>
  ): Promise<PageData> {
    try {
      const existingPage = await prisma.page.findUnique({
        where: { id },
      });

      if (!existingPage) {
        throw new ApiError(`Page with ID '${id}' not found`, 404);
      }

      const updateData: Prisma.PageUpdateInput = {
        lastModified: new Date(),
      };

      if (data.content) {
        const existingContent = existingPage.content as PageContent;
        updateData.content = {
          ...existingContent,
          ...data.content,
          lastModified: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue;
      }

      if (data.pageId) updateData.pageId = data.pageId;
      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (typeof data.isPublished === "boolean")
        updateData.isPublished = data.isPublished;

      const page = await prisma.page.update({
        where: { id },
        data: updateData,
      });

      return this.transformPageData(page);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to patch page", 500, { originalError: error });
    }
  }

  /**
   * Transform Prisma page data to our PageData interface
   */
  private static transformPageData(page: PrismaPage): PageData {
    return {
      id: page.id,
      pageId: page.pageId,
      title: page.title,
      description: page.description,
      lastModified: page.lastModified,
      isPublished: page.isPublished,
      content: page.content as PageContent,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  /**
   * Utility function to validate page content structure
   */
  static validatePageContent(content: unknown): boolean {
    if (!isRecord(content)) {
      return false;
    }

    const required = ["pageId", "title", "description", "lastModified"];
    return required.every((field) => field in content);
  }

  /**
   * Get page statistics
   */
  static async getPageStats() {
    try {
      const [total, published, unpublished] = await Promise.all([
        prisma.page.count(),
        prisma.page.count({ where: { isPublished: true } }),
        prisma.page.count({ where: { isPublished: false } }),
      ]);

      return {
        total,
        published,
        unpublished,
      };
    } catch (error) {
      throw new ApiError("Failed to fetch page statistics", 500, {
        originalError: error,
      });
    }
  }
}

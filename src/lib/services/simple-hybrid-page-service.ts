import { PageService } from "./page-service";
import { JsonPageService } from "./json-page-service";
import { isReadOnlyFileSystem } from "@/lib/utils/environment-helpers";
import type { PageContent } from "@/lib/types/page";

/**
 * Simplified Hybrid Page Service
 * 
 * Provides clean database-first with JSON fallback functionality
 * without complex caching layers
 */
export class SimpleHybridPageService {
  /**
   * Get page content with database-first, JSON fallback approach
   */
  static async getPageContent(pageId: string): Promise<{ data: PageContent; source: 'database' | 'json' } | null> {

    // Try database first
    try {
      const dbPage = await PageService.getPageByPageId(pageId);
      if (dbPage && dbPage.content && dbPage.isPublished) {
        return { 
          data: dbPage.content, 
          source: 'database' 
        };
      }
    } catch (error) {
      console.warn(`⚠️ Database lookup failed for '${pageId}':`, error);
    }

    // Fallback to JSON file
    try {
      const jsonPage = await JsonPageService.getPageByFilename(`${pageId}.json`);
      if (jsonPage) {
        return { 
          data: jsonPage, 
          source: 'json' 
        };
      }
    } catch (error) {
      console.error(`❌ JSON lookup failed for '${pageId}':`, error);
    }

    // Nothing found
    console.error(`❌ Page '${pageId}' not found in either database or JSON`);
    return null;
  }

  /**
   * Update page content with environment-appropriate sync
   */
  static async updatePageContent(pageId: string, content: PageContent): Promise<boolean> {
    const updatedContent = {
      ...content,
      lastModified: new Date().toISOString(),
    };

    let databaseSuccess = false;
    let jsonSuccess = false;

    // Always try to update database
    try {
      const existingPage = await PageService.getPageByPageId(pageId);
      
      if (existingPage) {
        await PageService.patchPage(existingPage.id, { content: updatedContent });
        databaseSuccess = true;
      } else {
        // Create new page in database
        await PageService.createPage({
          pageId,
          title: updatedContent.title || 'Untitled Page',
          description: updatedContent.description || 'No description',
          isPublished: updatedContent.published || false,
          content: updatedContent
        });
        databaseSuccess = true;
      }
    } catch (dbError) {
      console.error(`❌ Database update failed for '${pageId}':`, dbError);
    }

    // Update JSON file (only in development or if not read-only)
    if (!isReadOnlyFileSystem()) {
      try {
        await JsonPageService.updatePageByFilename(`${pageId}.json`, updatedContent);
        jsonSuccess = true;
      } catch (jsonError) {
        console.warn(`⚠️ JSON file update failed for '${pageId}':`, jsonError);
      }
    } else {
      jsonSuccess = true; // Consider it successful in production
    }

    const success = databaseSuccess;
    void jsonSuccess;

    return success;
  }

  /**
   * Get all pages from both sources (simplified)
   */
  static async getAllPages() {
    const pages = new Map();

    // Get from database
    try {
      const dbPages = await PageService.getPages({ limit: 100 });
      for (const page of dbPages.data) {
        pages.set(page.pageId, {
          id: page.pageId,
          pageId: page.pageId,
          title: page.title,
          description: page.description,
          lastModified: page.lastModified,
          isPublished: page.isPublished,
          source: "database",
        });
      }
    } catch (error) {
      console.warn("⚠️ Failed to get pages from database:", error);
    }

    // Get from JSON files (for any missing pages)
    try {
      const jsonPages = await JsonPageService.getAllPages();
      for (const page of jsonPages) {
        if (!pages.has(page.id)) {
          pages.set(page.id, {
            id: page.id,
            pageId: page.id,
            title: page.title,
            description: page.description,
            lastModified: page.lastModified,
            isPublished: page.published,
            source: "json",
          });
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to get pages from JSON files:", error);
    }

    return Array.from(pages.values());
  }
}

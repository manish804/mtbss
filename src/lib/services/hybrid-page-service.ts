import { PageService } from "./page-service";
import { JsonPageService } from "./json-page-service";
import { ContentSyncService } from "./content-sync-service";
import { getEnvironmentInfo } from "@/lib/utils/environment-helpers";
import type { PageContent } from "@/lib/types/page";
import { unstable_cache } from "next/cache";

const isProduction = process.env.NODE_ENV === "production";

function debugWarn(message: string): void {
  if (!isProduction) {
    console.warn(message);
  }
}

export class HybridPageService {
  static async getPageContent(pageId: string): Promise<PageContent | null> {
    const envInfo = getEnvironmentInfo();

    if (envInfo.isReadOnly) {


      try {
        const dbPage = await PageService.getPageByPageId(pageId);
        if (dbPage && dbPage.content) {
          debugWarn(
            `📊 ✅ Retrieved UPDATED page '${pageId}' from database (read-only environment)`
          );
          debugWarn(`📊 Database lastModified: ${dbPage.content.lastModified}`);
          return dbPage.content;
        } else {
          debugWarn(
            `⚠️ No database content found for '${pageId}' in read-only environment`
          );
        }
      } catch (error) {
        console.error(
          `❌ Database lookup failed for '${pageId}' in read-only environment:`,
          error
        );
      }

      try {
        const jsonPage = await JsonPageService.getPageByFilename(
          `${pageId}.json`
        );
        if (jsonPage) {
          debugWarn(
            `📄 ⚠️ Fallback: Retrieved STATIC page '${pageId}' from JSON file (database unavailable)`
          );
          debugWarn(`📄 JSON lastModified: ${jsonPage.lastModified}`);
          return jsonPage;
        }
      } catch (error) {
        console.error(`❌ JSON fallback failed for '${pageId}':`, error);
      }
    } else {
      try {
        const dbPage = await PageService.getPageByPageId(pageId);
        if (dbPage && dbPage.content) {
          return dbPage.content;
        }
      } catch (error) {
        console.warn(
          `⚠️ Database lookup failed for '${pageId}', falling back to JSON:`,
          error
        );
      }

      try {
        const jsonPage = await JsonPageService.getPageByFilename(
          `${pageId}.json`
        );
        if (jsonPage) {
          return jsonPage;
        }
      } catch (error) {
        console.error(`❌ JSON lookup failed for '${pageId}':`, error);
      }
    }

    return null;
  }

  static async getCachedPageContent(
    pageId: string,
    revalidateSeconds: number = 300
  ): Promise<PageContent | null> {
    const getCached = unstable_cache(
      async () => this.getPageContent(pageId),
      [`hybrid-page-content-${pageId}`],
      { revalidate: revalidateSeconds }
    );

    return getCached();
  }

  static async updatePageContent(
    pageId: string,
    content: PageContent
  ): Promise<boolean> {
    const envInfo = getEnvironmentInfo();


    try {
      await ContentSyncService.updatePageContent(pageId, content);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to update page '${pageId}' via ContentSyncService:`,
        error
      );

      if (envInfo.isReadOnly) {
        try {
          const existingPage = await PageService.getPageByPageId(pageId);
          if (existingPage) {
            await PageService.patchPage(existingPage.id, { content });
            debugWarn(`📊 Fallback: Updated page '${pageId}' in database only`);
            return true;
          } else {
            console.error(
              `❌ Page '${pageId}' not found in database for fallback update`
            );
            return false;
          }
        } catch (dbError) {
          console.error(
            `❌ Database fallback failed for page '${pageId}':`,
            dbError
          );
          return false;
        }
      } else {
        try {
          await JsonPageService.updatePageByFilename(`${pageId}.json`, content);
          debugWarn(`📄 Fallback: Updated page '${pageId}' in JSON file only`);
          return true;
        } catch (jsonError) {
          console.error(
            `❌ JSON fallback failed for page '${pageId}':`,
            jsonError
          );
          return false;
        }
      }
    }
  }

  static async getAllPages() {
    const pages = new Map();

    try {
      const dbPages = await PageService.getPages({ limit: 100 });
      for (const page of dbPages.data) {
        pages.set(page.pageId, {
          ...page,
          source: "database",
        });
      }
    } catch (error) {
      console.warn("⚠️ Failed to get pages from database:", error);
    }

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

  static async getPageStats() {
    try {
      const dbStats = await PageService.getPageStats();
      return dbStats;
    } catch (error) {
      console.warn("⚠️ Database stats failed, falling back to JSON:", error);

      try {
        const jsonStats = await JsonPageService.getPageStats();
        return jsonStats;
      } catch (jsonError) {
        console.error("❌ Both database and JSON stats failed:", jsonError);
        return { total: 0, published: 0, unpublished: 0 };
      }
    }
  }
}

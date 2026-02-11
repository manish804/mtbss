import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import type { PageContent } from "@/lib/types/page";
import { JsonContentValidationService } from "./json-content-validation-service";
import { isReadOnlyFileSystem } from "@/lib/utils/environment-helpers";

export interface JsonPageInfo {
  id: string;
  filename: string;
  title: string;
  description: string;
  lastModified: string;
  published: boolean;
  path: string;
  validationStatus?: "complete" | "incomplete" | "error";
}

export class JsonPageService {
  private static pagesDir = join(process.cwd(), "src/lib/pages");

  /**
   * Get all available JSON pages with validation status
   */
  static async getAllPages(): Promise<JsonPageInfo[]> {
    try {
      const files = readdirSync(this.pagesDir).filter((file) =>
        file.endsWith(".json")
      );
      const pages: JsonPageInfo[] = [];

      const validations =
        await JsonContentValidationService.getAllPageValidations();
      const validationMap = new Map(
        validations.map((v) => [v.filename, v.status])
      );

      for (const file of files) {
        try {
          const filePath = join(this.pagesDir, file);
          const content = readFileSync(filePath, "utf-8");
          const data = JSON.parse(content);

          pages.push({
            id: data.pageId || file.replace(".json", ""),
            filename: file,
            title: data.title || "Untitled Page",
            description: data.description || "No description available",
            lastModified: data.lastModified || new Date().toISOString(),
            published: data.published || false,
            path: filePath,
            validationStatus: validationMap.get(file) || "incomplete",
          });
        } catch (error) {
          console.error(`Error reading ${file}:`, error);
          pages.push({
            id: file.replace(".json", ""),
            filename: file,
            title: "Error Loading Page",
            description: "Failed to load page content",
            lastModified: new Date().toISOString(),
            published: false,
            path: join(this.pagesDir, file),
            validationStatus: "error",
          });
        }
      }

      return pages.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error("Error reading pages directory:", error);
      return [];
    }
  }

  /**
   * Get a specific page by filename
   */
  static async getPageByFilename(
    filename: string
  ): Promise<PageContent | null> {
    try {
      const filePath = join(this.pagesDir, filename);
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return null;
    }
  }

  /**
   * Update a page by filename
   */
  static async updatePageByFilename(
    filename: string,
    content: PageContent
  ): Promise<boolean> {
    
    if (isReadOnlyFileSystem()) {
      
      return true;
    }

    try {
      const filePath = join(this.pagesDir, filename);

      const updatedContent = {
        ...content,
        lastModified: new Date().toISOString(),
      };

      writeFileSync(filePath, JSON.stringify(updatedContent, null, 2), "utf-8");
      return true;
    } catch (error) {
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EROFS') {
        console.warn(`⚠️ Read-only file system detected for ${filename}, skipping JSON update:`, error);
        return true; 
      }

      console.error(`Error updating ${filename}:`, error);
      return false;
    }
  }

  /**
   * Get page statistics
   */
  static async getPageStats() {
    const pages = await this.getAllPages();
    const published = pages.filter((page) => page.published).length;

    return {
      total: pages.length,
      published,
      unpublished: pages.length - published,
    };
  }
}

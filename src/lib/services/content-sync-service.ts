/**
 * Content Synchronization Service
 * Handles synchronization between JSON files and database
 * Ensures data consistency across both storage methods
 */

import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transformJsonToPageContent } from "@/lib/utils/data-transform";
import { isReadOnlyFileSystem } from "@/lib/utils/environment-helpers";
import type { PageContent } from "@/lib/types/page";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

export class ContentSyncService {
  
  static async updatePageContent(
    pageId: string,
    updates: Partial<PageContent>
  ): Promise<void> {
    try {
      
      if (!isReadOnlyFileSystem()) {
        await this.updateJsonFile(pageId, updates);
      } 

      await this.updateDatabase(pageId, updates);
      
    } catch (error) {
      console.error(`❌ Failed to sync page '${pageId}':`, error);
      throw error;
    }
  }

  /**
   * Update JSON file with new content
   */
  private static async updateJsonFile(
    pageId: string,
    updates: Partial<PageContent>
  ): Promise<void> {
    try {
    
      if (isReadOnlyFileSystem()) {
        return;
      }

      const filePath = join(process.cwd(), "src/lib/pages", `${pageId}.json`);

      const existingData = JSON.parse(readFileSync(filePath, "utf-8"));

      const updatedData = {
        ...existingData,
        ...updates,
        lastModified: new Date().toISOString(),
      };

      writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");

    } catch (error) {
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EROFS') {
        console.warn(`⚠️ Read-only file system detected for ${pageId}, skipping JSON update:`, error);
        return;
      }
      
      console.error(`❌ Failed to update JSON file for ${pageId}:`, error);
      throw new Error(`Failed to update JSON file: ${error}`);
    }
  }

  /**
   * Update database with new content
   */
  private static async updateDatabase(
    pageId: string,
    updates: Partial<PageContent>
  ): Promise<void> {
    try {
      const existingPage = await prisma.page.findUnique({
        where: { pageId },
      });

      if (!existingPage) {
        
      
        let initialContent: PageContent;
        
        if (isReadOnlyFileSystem()) {
          
          initialContent = {
            pageId,
            title: updates.title || 'Untitled Page',
            description: updates.description || 'No description',
            lastModified: new Date().toISOString(),
            published: updates.published || false,
            ...updates
          } as PageContent;
          
        } else {
          
          try {
            const filePath = join(process.cwd(), "src/lib/pages", `${pageId}.json`);
            const jsonData = JSON.parse(readFileSync(filePath, "utf-8"));
            initialContent = transformJsonToPageContent(jsonData);
          } catch (jsonError) {
            console.warn(`⚠️ Could not read JSON file for '${pageId}', using updates:`, jsonError);
            initialContent = {
              pageId,
              title: updates.title || 'Untitled Page',
              description: updates.description || 'No description',
              lastModified: new Date().toISOString(),
              published: updates.published || false,
              ...updates
            } as PageContent;
          }
        }

        await prisma.page.create({
          data: {
            pageId: initialContent.pageId,
            title: initialContent.title,
            description: initialContent.description,
            lastModified: new Date(initialContent.lastModified),
            isPublished: initialContent.published,
            content: initialContent as unknown as Prisma.InputJsonValue,
          },
        });

      } else {
        const existingContent = existingPage.content as PageContent;
        const mergedContent = {
          ...existingContent,
          ...updates,
          lastModified: new Date().toISOString(),
        };

        await prisma.page.update({
          where: { pageId },
          data: {
            title: updates.title || existingPage.title,
            description: updates.description || existingPage.description,
            lastModified: new Date(),
            isPublished:
              updates.published !== undefined
                ? updates.published
                : existingPage.isPublished,
            content: mergedContent as unknown as Prisma.InputJsonValue,
          },
        });

      }
    } catch (error) {
      console.error(`❌ Failed to update database for ${pageId}:`, error);
      throw new Error(`Failed to update database: ${error}`);
    }
  }

  /**
   * Sync all JSON files to database
   */
  static async syncAllJsonToDatabase(): Promise<void> {

    const pageFiles = [
      "home.json",
      "about.json",
      "contact.json",
      "services.json",
    ];

    for (const file of pageFiles) {
      try {
        const filePath = join(process.cwd(), "src/lib/pages", file);
        const jsonData = JSON.parse(readFileSync(filePath, "utf-8"));
        const content = transformJsonToPageContent(jsonData);

        await prisma.page.upsert({
          where: { pageId: content.pageId },
          update: {
            title: content.title,
            description: content.description,
            lastModified: new Date(content.lastModified),
            isPublished: content.published,
            content: content as unknown as Prisma.InputJsonValue,
          },
          create: {
            pageId: content.pageId,
            title: content.title,
            description: content.description,
            lastModified: new Date(content.lastModified),
            isPublished: content.published,
            content: content as unknown as Prisma.InputJsonValue,
          },
        });

      } catch (error) {
        console.error(`❌ Failed to sync ${file}:`, error);
      }
    }

  }

  /**
   * Sync database back to JSON files
   */
  static async syncDatabaseToJson(): Promise<void> {

  
    if (isReadOnlyFileSystem()) {
      return;
    }

    try {
      const pages = await prisma.page.findMany();

      for (const page of pages) {
        const filePath = join(
          process.cwd(),
          "src/lib/pages",
          `${page.pageId}.json`
        );
        const content = page.content as PageContent;

        writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");

      }

    } catch (error) {
      console.error("❌ Failed to sync database to JSON:", error);
      throw error;
    }
  }

 
  static async updateContentData(updates: Record<string, unknown>): Promise<void> {
    try {
    
      if (!isReadOnlyFileSystem()) {
        const filePath = join(process.cwd(), "src/lib/content-data.json");
        const existingData = JSON.parse(readFileSync(filePath, "utf-8"));

        const updatedData = {
          ...existingData,
          ...updates,
        };

        writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
      } else {
      }

      if (Array.isArray(updates.jobOpenings)) {
        await this.syncJobOpeningsToDatabase(updates.jobOpenings);
      }

    } catch (error) {
      console.error("❌ Failed to update content data:", error);
      throw error;
    }
  }

  /**
   * Sync job openings to database
   */
  private static async syncJobOpeningsToDatabase(
    jobOpenings: unknown[]
  ): Promise<void> {
    for (const job of jobOpenings) {
      try {
        const jobRecord = toRecord(job);
        const id = typeof jobRecord.id === "string" ? jobRecord.id : null;
        if (!id) {
          continue;
        }

        const title =
          typeof jobRecord.title === "string" ? jobRecord.title : "Untitled Job";
        const department =
          typeof jobRecord.department === "string"
            ? jobRecord.department
            : "general";
        const location =
          typeof jobRecord.location === "string" ? jobRecord.location : "Remote";
        const type =
          typeof jobRecord.jobType === "string" ? jobRecord.jobType : "Full-time";
        const experience =
          typeof jobRecord.experience === "string" ? jobRecord.experience : "";
        const salary =
          typeof jobRecord.salaryRange === "string" ? jobRecord.salaryRange : "";
        const description =
          typeof jobRecord.description === "string"
            ? jobRecord.description
            : "";

        const applicationDeadline = toDate(jobRecord.applicationDeadline);
        const postedDate = toDate(jobRecord.lastModified) ?? new Date();

        const jobData = {
          id,
          title,
          department,
          location,
          type,
          experience,
          salary,
          description,
          requirements: toStringArray(jobRecord.requirements),
          responsibilities: toStringArray(jobRecord.responsibilities),
          skills: toStringArray(jobRecord.skills),
          benefits: toStringArray(jobRecord.benefits),
          isActive:
            typeof jobRecord.published === "boolean" ? jobRecord.published : true,
          applicationDeadline,
          postedDate,
          companyId:
            typeof jobRecord.companyId === "string"
              ? jobRecord.companyId
              : "mtbs-landing-main",
        };

        await prisma.jobOpening.upsert({
          where: { id: jobData.id },
          update: {
            ...jobData,
            updatedAt: new Date(),
          },
          create: jobData,
        });

      } catch (error) {
        const jobTitle = toRecord(job).title;
        console.error(
          `❌ Failed to sync job ${
            typeof jobTitle === "string" ? jobTitle : "unknown"
          }:`,
          error
        );
      }
    }
  }

  /**
   * Validate data consistency between JSON and database
   */
  static async validateDataConsistency(): Promise<{
    consistent: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const pageFiles = [
        "home.json",
        "about.json",
        "contact.json",
        "services.json",
      ];

      for (const file of pageFiles) {
          const pageId = file.replace(".json", "");

        try {
          const filePath = join(process.cwd(), "src/lib/pages", file);
          const jsonData = toRecord(JSON.parse(readFileSync(filePath, "utf-8")));

          const dbPage = await prisma.page.findUnique({
            where: { pageId },
          });

          if (!dbPage) {
            issues.push(`Page '${pageId}' exists in JSON but not in database`);
            continue;
          }

          const jsonModified = new Date(
            typeof jsonData.lastModified === "string"
              ? jsonData.lastModified
              : 0
          );
          const dbModified = new Date(dbPage.lastModified);

          if (Math.abs(jsonModified.getTime() - dbModified.getTime()) > 1000) {
            issues.push(
              `Page '${pageId}' has different lastModified dates (JSON: ${jsonModified.toISOString()}, DB: ${dbModified.toISOString()})`
            );
          }

          if (jsonData.title !== dbPage.title) {
            issues.push(
              `Page '${pageId}' has different titles (JSON: "${
                typeof jsonData.title === "string" ? jsonData.title : ""
              }", DB: "${dbPage.title}")`
            );
          }
        } catch (error) {
          issues.push(`Failed to validate page '${pageId}': ${error}`);
        }
      }

      return {
        consistent: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Validation failed: ${error}`);
      return {
        consistent: false,
        issues,
      };
    }
  }
}

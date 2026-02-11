/**
 * Migration script to import existing JSON page data into the database
 * Run with: npm run db:migrate
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transformJsonToPageContent } from "@/lib/utils/data-transform";

async function migrateJsonData() {
  console.log("Starting JSON data migration...");

  try {
    const pagesDir = join(process.cwd(), "src/lib/pages");
    const jsonFiles = readdirSync(pagesDir).filter((file) =>
      file.endsWith(".json")
    );

    console.log(`Found ${jsonFiles.length} JSON files to migrate`);

    for (const file of jsonFiles) {
      const filePath = join(pagesDir, file);
      const rawData = readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(rawData);

      console.log(`Processing ${file}...`);

      const content = transformJsonToPageContent(jsonData);

      const existingPage = await prisma.page.findUnique({
        where: { pageId: content.pageId },
      });

      if (existingPage) {
        console.log(`  Page ${content.pageId} already exists, updating...`);

        await prisma.page.update({
          where: { pageId: content.pageId },
          data: {
            title: content.title,
            description: content.description,
            lastModified: new Date(content.lastModified),
            isPublished: content.published,
            content: content as unknown as Prisma.InputJsonValue,
          },
        });
      } else {
        console.log(`  Creating new page ${content.pageId}...`);

        await prisma.page.create({
          data: {
            pageId: content.pageId,
            title: content.title,
            description: content.description,
            lastModified: new Date(content.lastModified),
            isPublished: content.published,
            content: content as unknown as Prisma.InputJsonValue,
          },
        });
      }

      console.log(`  ✓ Successfully processed ${content.pageId}`);
    }

    console.log("\n✅ Migration completed successfully!");

    const totalPages = await prisma.page.count();
    const publishedPages = await prisma.page.count({
      where: { isPublished: true },
    });

    console.log(`\nSummary:`);
    console.log(`- Total pages: ${totalPages}`);
    console.log(`- Published pages: ${publishedPages}`);
    console.log(`- Draft pages: ${totalPages - publishedPages}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateJsonData();
}

export { migrateJsonData };

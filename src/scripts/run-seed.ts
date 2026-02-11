#!/usr/bin/env node

/**
 * Run database seeding with options
 * Usage: npm run db:seed [options]
 * Options:
 *   --reset: Reset database before seeding
 *   --validate: Validate data consistency after seeding
 *   --sync: Sync JSON to database after seeding
 */

import { seedDatabase } from "./seed-database";
import { ContentSyncService } from "@/lib/services/content-sync-service";
import { prisma } from "@/lib/prisma";

async function runSeed() {
  const args = process.argv.slice(2);
  const options = {
    reset: args.includes("--reset"),
    validate: args.includes("--validate"),
    sync: args.includes("--sync"),
  };

  console.log("🚀 Starting database seeding with options:", options);

  try {
    if (options.reset) {
      console.log("🔄 Resetting database...");
      await prisma.jobApplication.deleteMany();
      await prisma.jobOpening.deleteMany();
      await prisma.company.deleteMany();
      await prisma.page.deleteMany();
      console.log("✅ Database reset completed");
    }

    await seedDatabase();

    if (options.sync) {
      console.log("🔄 Syncing JSON files to database...");
      await ContentSyncService.syncAllJsonToDatabase();
      console.log("✅ JSON sync completed");
    }

    if (options.validate) {
      console.log("🔍 Validating data consistency...");
      const validation = await ContentSyncService.validateDataConsistency();

      if (validation.consistent) {
        console.log("✅ Data is consistent between JSON and database");
      } else {
        console.log("⚠️  Data inconsistencies found:");
        validation.issues.forEach((issue) => {
          console.log(`  - ${issue}`);
        });
      }
    }

    console.log("\n🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runSeed();
}

export { runSeed };

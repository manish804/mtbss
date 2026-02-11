/**
 * Comprehensive database seeding script
 * Seeds all JSON data into the database and ensures API compatibility
 * Run with: npm run db:seed
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transformJsonToPageContent } from "@/lib/utils/data-transform";

async function seedPages() {
  console.log("🌱 Seeding pages...");

  const pageFiles = [
    "home.json",
    "about.json",
    "contact.json",
    "services.json",
    "jobs.json",
  ];

  for (const file of pageFiles) {
    try {
      const filePath = join(process.cwd(), "src/lib/pages", file);
      const rawData = readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(rawData);

      console.log(`  Processing ${file}...`);

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

      console.log(`  ✅ Successfully seeded page: ${content.pageId}`);
    } catch (error) {
      console.error(`  ❌ Error seeding ${file}:`, error);
    }
  }
}

async function seedJobOpenings() {
  console.log("🌱 Seeding job openings...");

  try {
    const filePath = join(process.cwd(), "src/lib/content-data.json");
    const rawData = readFileSync(filePath, "utf-8");
    const contentData = JSON.parse(rawData);

    const jobOpenings = contentData.jobOpenings || [];

    for (const job of jobOpenings) {
      console.log(`  Processing job: ${job.title}...`);

      const jobData = {
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.jobType,
        experience: job.experience,
        salary: job.salaryRange,
        description: job.description,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        skills: [],
        benefits: job.benefits || [],
        isActive: job.published || true,
        applicationDeadline: null,
        postedDate: new Date(job.lastModified || new Date()),
        companyId: null,
      };

      await prisma.jobOpening.upsert({
        where: { id: jobData.id },
        update: {
          title: jobData.title,
          department: jobData.department,
          location: jobData.location,
          type: jobData.type,
          experience: jobData.experience,
          salary: jobData.salary,
          description: jobData.description,
          requirements: jobData.requirements,
          responsibilities: jobData.responsibilities,
          skills: jobData.skills,
          benefits: jobData.benefits,
          isActive: jobData.isActive,
        },
        create: jobData,
      });

      console.log(`  ✅ Successfully seeded job: ${job.title}`);
    }
  } catch (error) {
    console.error("  ❌ Error seeding job openings:", error);
  }
}

async function seedCompany() {
  console.log("🌱 Seeding company information...");

  try {
    const companyData = {
      id: "cmfuy0klm00005df00oqkfp94",
      name: "MTBS Landing",
      description:
        "Professional tax management and financial services platform designed to revolutionize how users handle their tax obligations and financial planning.",
      website: "https://mtbs-landing.com",
      email: "contact@mtbs-landing.com",
      phone: "(555) 555-5555",
      address: "Number, Street, City, State, Zip Code",
      industry: "Financial Services",
      foundedYear: 2020,
      employeeCount: "15-50",
      headquarters: "United States",
      socialLinks: {
        linkedin: "https://linkedin.com/company/mtbs-landing",
        twitter: "https://twitter.com/mtbslanding",
        facebook: "https://facebook.com/mtbslanding",
      },
      isActive: true,
    };

    await prisma.company.upsert({
      where: { id: companyData.id },
      update: {
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        industry: companyData.industry,
        foundedYear: companyData.foundedYear,
        employeeCount: companyData.employeeCount,
        headquarters: companyData.headquarters,
        socialLinks: companyData.socialLinks,
        isActive: companyData.isActive,
      },
      create: companyData,
    });

    console.log("  ✅ Successfully seeded company information");
  } catch (error) {
    console.error("  ❌ Error seeding company:", error);
  }
}

async function updateJobsWithCompany() {
  console.log("🔗 Linking jobs to company...");

  try {
    await prisma.jobOpening.updateMany({
      where: { companyId: null },
      data: { companyId: "cmfuy0klm00005df00oqkfp94" },
    });

    console.log("  ✅ Successfully linked jobs to company");
  } catch (error) {
    console.error("  ❌ Error linking jobs to company:", error);
  }
}

async function showSummary() {
  console.log("\n📊 Database Summary:");

  try {
    const pageCount = await prisma.page.count();
    const publishedPageCount = await prisma.page.count({
      where: { isPublished: true },
    });
    const jobCount = await prisma.jobOpening.count();
    const activeJobCount = await prisma.jobOpening.count({
      where: { isActive: true },
    });
    const companyCount = await prisma.company.count();
    const applicationCount = await prisma.jobApplication.count();

    console.log(
      `  📄 Pages: ${pageCount} total (${publishedPageCount} published)`
    );
    console.log(
      `  💼 Job Openings: ${jobCount} total (${activeJobCount} active)`
    );
    console.log(`  🏢 Companies: ${companyCount}`);
    console.log(`  📝 Applications: ${applicationCount}`);

    const pages = await prisma.page.findMany({
      select: { pageId: true, title: true, isPublished: true },
    });

    console.log("\n  📄 Pages:");
    pages.forEach((page) => {
      const status = page.isPublished ? "✅" : "⏸️";
      console.log(`    ${status} ${page.pageId}: ${page.title}`);
    });

    const jobsByDept = await prisma.jobOpening.groupBy({
      by: ["department"],
      _count: { department: true },
      where: { isActive: true },
    });

    console.log("\n  💼 Active Jobs by Department:");
    jobsByDept.forEach((dept) => {
      console.log(`    ${dept.department}: ${dept._count.department} jobs`);
    });
  } catch (error) {
    console.error("❌ Error generating summary:", error);
  }
}

async function main() {
  console.log("🚀 Starting database seeding...\n");

  try {
    await seedCompany();
    await seedPages();
    await seedJobOpenings();
    await updateJobsWithCompany();

    console.log("\n✅ Database seeding completed successfully!");

    await showSummary();
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as seedDatabase };

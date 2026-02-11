import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  const existingCompany = await prisma.company.findFirst();
  if (existingCompany) {
    console.log("✅ Company already exists, skipping seed");
    return;
  }

  const company = await prisma.company.create({
    data: {
      name: "TechCorp Solutions",
      description:
        "A leading technology company specializing in innovative software solutions and digital transformation services.",
      website: "https://techcorp.example.com",
      email: "contact@techcorp.example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Tech Street, Silicon Valley, CA 94000",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
      industry: "Technology",
      foundedYear: 2015,
      employeeCount: "50-100",
      headquarters: "Silicon Valley, CA",
      socialLinks: {
        linkedin: "https://linkedin.com/company/techcorp",
        twitter: "https://twitter.com/techcorp",
        facebook: "https://facebook.com/techcorp",
      },
      showName: true,
      showDescription: true,
      showWebsite: true,
      showEmail: true,
      showPhone: true,
      showAddress: true,
      showLogo: true,
      showIndustry: true,
      showFoundedYear: true,
      showEmployeeCount: true,
      showHeadquarters: true,
      showSocialLinks: true,
      isActive: true,
    },
  });

  console.log("✅ Company created:", company.name);

  const jobOpenings = await Promise.all([
    prisma.jobOpening.create({
      data: {
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "San Francisco, CA",
        type: "Full-time",
        experience: "5+ years",
        salary: "$120,000 - $180,000",
        description:
          "We are looking for a Senior Software Engineer to join our dynamic team and help build innovative software solutions.",
        requirements: [
          "Bachelor's degree in Computer Science",
          "5+ years experience with React/Node.js",
          "Strong problem-solving skills",
        ],
        responsibilities: [
          "Design and develop scalable applications",
          "Collaborate with cross-functional teams",
          "Mentor junior developers",
        ],
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        benefits: ["Health insurance", "Remote work options", "401k matching"],
        isActive: true,
        companyId: company.id,
      },
    }),
    prisma.jobOpening.create({
      data: {
        title: "Product Manager",
        department: "Product",
        location: "San Francisco, CA",
        type: "Full-time",
        experience: "3+ years",
        salary: "$100,000 - $150,000",
        description:
          "Join our product team to drive innovation and strategy for our cutting-edge products.",
        requirements: [
          "MBA preferred",
          "3+ years product management experience",
          "Strong analytical skills",
        ],
        responsibilities: [
          "Define product roadmap",
          "Work with engineering teams",
          "Analyze market trends",
        ],
        skills: ["Product strategy", "Data analysis", "Agile methodologies"],
        benefits: [
          "Health insurance",
          "Stock options",
          "Professional development",
        ],
        isActive: true,
        companyId: company.id,
      },
    }),
    prisma.jobOpening.create({
      data: {
        title: "UX/UI Designer",
        department: "Design",
        location: "Remote",
        type: "Full-time",
        experience: "3+ years",
        salary: "$80,000 - $120,000",
        description:
          "Create beautiful and intuitive user experiences that delight our customers.",
        requirements: [
          "Portfolio required",
          "3+ years design experience",
          "Figma proficiency",
        ],
        responsibilities: [
          "Design user interfaces",
          "Conduct user research",
          "Create design systems",
        ],
        skills: [
          "Figma",
          "Adobe Creative Suite",
          "User research",
          "Prototyping",
        ],
        benefits: [
          "Health insurance",
          "Remote work",
          "Design conference budget",
        ],
        isActive: true,
        companyId: company.id,
      },
    }),
  ]);

  console.log(`✅ Created ${jobOpenings.length} job openings`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PublicCompanyData } from "@/lib/types/company";

function normalizeSocialLinks(
  value: unknown
): Record<string, string | undefined> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const links = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === "string" ? item : undefined,
    ])
  );

  return Object.keys(links).length > 0 ? links : null;
}

const getCachedPublicCompanyData = unstable_cache(
  async (): Promise<PublicCompanyData | null> => {
    const company = await prisma.company.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!company) {
      return null;
    }

    return {
      id: company.id,
      name: company.showName ? company.name : null,
      description: company.showDescription ? company.description : null,
      website: company.showWebsite ? company.website : null,
      email: company.showEmail ? company.email : null,
      phone: company.showPhone ? company.phone : null,
      address: company.showAddress ? company.address : null,
      logo: company.showLogo ? company.logo : null,
      industry: company.showIndustry ? company.industry : null,
      foundedYear: company.showFoundedYear ? company.foundedYear : null,
      employeeCount: company.showEmployeeCount ? company.employeeCount : null,
      headquarters: company.showHeadquarters ? company.headquarters : null,
      socialLinks: company.showSocialLinks
        ? normalizeSocialLinks(company.socialLinks)
        : null,
      isActive: company.isActive,
    };
  },
  ["public-company-data"],
  { revalidate: 300, tags: ["public-company"] }
);

export async function getPublicCompanyData(): Promise<PublicCompanyData | null> {
  return getCachedPublicCompanyData();
}

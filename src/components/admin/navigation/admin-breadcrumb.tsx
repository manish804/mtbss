"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface AdminBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumb({ items, className }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  const breadcrumbItems = items || generateBreadcrumbFromPath(pathname);

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-xs sm:text-sm text-gray-500 overflow-x-auto",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link
        href="/admin"
        className="flex items-center hover:text-gray-700 transition-colors shrink-0"
      >
        <Home className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only">Admin Dashboard</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center shrink-0">
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 text-gray-400" />
          {item.href && !item.current ? (
            <Link
              href={item.href}
              className="hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "whitespace-nowrap",
                item.current ? "text-gray-900 font-medium" : "text-gray-500"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  const adminIndex = segments.indexOf("admin");
  if (adminIndex !== -1) {
    segments.splice(adminIndex, 1);
  }

  let currentPath = "/admin";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    const label = formatSegmentLabel(segment);

    items.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  return items;
}

function formatSegmentLabel(segment: string): string {
  const specialCases: Record<string, string> = {
    "json-pages": " Pages",
    "content-data": "Content Data",
    jobs: "Jobs",
    contact: "Contact",
    about: "About",
    services: "Services",
    home: "Home",
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

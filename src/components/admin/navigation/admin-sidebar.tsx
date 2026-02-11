"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Database,
  Home,
  Users,
  Phone,
  Wrench,
  Building,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Calendar,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavigationItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  badge?: string;
  status?: "complete" | "incomplete" | "error";
}

type ValidationStatus = "complete" | "incomplete" | "error";

interface JsonValidationSummary {
  filename: string;
  status: ValidationStatus;
}

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "json-content",
    "leave-management",
  ]);
  const [pageStatuses, setPageStatuses] = useState<Record<string, ValidationStatus>>({});
  const [newMessageCount, setNewMessageCount] = useState(0);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((key) => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  useEffect(() => {
    const fetchPageStatuses = async () => {
      try {
        const response = await fetch("/api/json-content/validation");
        if (response.ok) {
          const result = await response.json();
          const validations: JsonValidationSummary[] = Array.isArray(result.data)
            ? result.data
            : [];

          const statusMap: Record<string, ValidationStatus> = {};
          validations.forEach((validation) => {
            const pageId = validation.filename.replace(".json", "");
            statusMap[pageId] = validation.status;
          });

          setPageStatuses(statusMap);
        }
      } catch (error) {
        console.error("Failed to fetch page statuses:", error);
      }
    };

    const fetchNewMessageCount = async () => {
      try {
        const response = await fetch("/api/contact-messages?status=new&limit=1");
        if (response.ok) {
          const result = await response.json();
          setNewMessageCount(result.pagination.total);
        }
      } catch (error) {
        console.error("Failed to fetch new message count:", error);
      }
    };

    fetchPageStatuses();
    fetchNewMessageCount();

    const handleFocus = () => {
      fetchPageStatuses();
      fetchNewMessageCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Company",
      href: "/admin/company",
      icon: Building,
    },
    {
      label: "Jobs Management",
      href: "/admin/jobs",
      icon: Briefcase,
    },
    {
      label: "Applications",
      href: "/admin/applications",
      icon: UserCheck,
    },
    {
      label: "Employee Management",
      icon: Users,
      children: [
        {
          label: "All Employees",
          href: "/admin/employees",
          icon: Users,
        },
        {
          label: "Add Employee",
          href: "/admin/employees/add",
          icon: Users,
        },
      ],
    },
    {
      label: "Leave Management",
      icon: Calendar,
      children: [
        {
          label: "All Leave Requests",
          href: "/admin/leaves",
          icon: Calendar,
        },
      ],
    },
    {
      label: " Content",
      icon: FileText,
      children: [
        {
          label: "Content Overview",
          href: "/admin/json-content",
          icon: LayoutDashboard,
        },
        {
          label: "All Pages",
          href: "/admin/json-pages",
          icon: FileText,
        },
        {
          label: "Home Page",
          href: "/admin/json-pages/home",
          icon: Home,
          status: pageStatuses["home"] || "incomplete",
        },
        {
          label: "About Page",
          href: "/admin/json-pages/about",
          icon: Users,
          status: pageStatuses["about"] || "incomplete",
        },
        {
          label: "Services Page",
          href: "/admin/json-pages/services",
          icon: Wrench,
          status: pageStatuses["services"] || "incomplete",
        },
        {
          label: "Contact Page",
          href: "/admin/json-pages/contact",
          icon: Phone,
          status: pageStatuses["contact"] || "incomplete",
        },
        {
          label: "Jobs Page Config",
          href: "/admin/json-pages/jobs",
          icon: Building,
          status: pageStatuses["jobs"] || "incomplete",
        },
      ],
    },
    {
      label: "Contact Messages",
      href: "/admin/contact-messages",
      icon: Mail,
      badge: newMessageCount > 0 ? newMessageCount.toString() : undefined,
    },
    {
      label: "Content Data",
      href: "/admin/content-data",
      icon: Database,
      status: "complete",
    },
  ];

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = item.href ? pathname === item.href : false;
    const hasChildren = item.children && item.children.length > 0;
    const sectionKey = item.label.toLowerCase().replace(/\s+/g, "-");
    const isExpanded = expandedSections.includes(sectionKey);

    return (
      <div key={item.label}>
        <div
          className={cn(
            "flex items-center justify-between px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors",
            level > 0 && "ml-2 sm:ml-4",
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
            hasChildren && "cursor-pointer"
          )}
          onClick={hasChildren ? () => toggleSection(sectionKey) : undefined}
        >
          <div className="flex items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center flex-1"
                onClick={onNavigate}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 mr-3",
                    isActive ? "text-blue-700" : "text-gray-400"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center flex-1">
                <item.icon className="h-4 w-4 mr-3 text-gray-400" />
                <span>{item.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {item.status && (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  item.status === "complete" && "bg-green-500",
                  item.status === "incomplete" && "bg-yellow-500",
                  item.status === "error" && "bg-red-500"
                )}
              />
            )}
            {item.badge && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <div className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {navigationItems.map((item) => renderNavigationItem(item))}
    </nav>
  );
}

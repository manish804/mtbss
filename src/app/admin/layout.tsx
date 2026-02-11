"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/navigation/admin-sidebar";
import { AdminBreadcrumb } from "@/components/admin/navigation/admin-breadcrumb";
import { MobileNav } from "@/components/admin/navigation/mobile-nav";
import { Toaster } from "@/components/ui/toaster";
import { usePublicCompany } from "@/hooks/use-company";
import { getResponsiveCompanyName, getCompanyInitials } from "@/lib/utils/company-name-utils";
import {
  Home,
  Menu,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { company } = usePublicCompany();

 
  const adminBrandName = getResponsiveCompanyName(company?.name, 'admin') || "ADMIN";
  const adminBrandInitial = getCompanyInitials(company?.name) || "A";

  useEffect(() => {
    const checkAuth = async () => {
      if (pathname === "/admin/login") {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push("/admin/login");
        }
      } catch {
        setIsAuthenticated(false);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/admin/login";
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className={`bg-white shadow-sm border-b fixed top-0 z-50 h-16 transition-all duration-300 ${
          sidebarOpen && !isMobile ? "left-64 right-0" : "left-0 right-0"
        }`}
      >
        <div className="px-2 sm:px-2 md:px-2 lg:px-2 h-full max-w-full overflow-x-hidden">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-4">
              <MobileNav onToggle={toggleSidebar} isOpen={sidebarOpen} />

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hidden lg:flex"
              >
                <Menu className="h-4 w-4" />
              </Button>
              {/* <Link href="/admin" className="text-xl font-bold text-gray-900">
                MTBS Admin
              </Link> */}
              <nav className="hidden xl:flex space-x-1">
                {/* <Link
                  href="/admin"
                  className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  href="/admin/jobs"
                  className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Jobs</span>
                </Link>
                <Link
                  href="/admin/applications"
                  className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Applications</span>
                </Link> */}
              </nav>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/" target="_blank" rel="noopener noreferrer">
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">View Site</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-64 sm:w-64 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 overflow-y-auto transition-transform duration-300 ${
          isMobile ? "z-50" : "z-30"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gray-50">
          <Link href="/admin" className="flex items-center space-x-2">
            {company?.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={company.logo}
                alt={company.name || "Admin"}
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{adminBrandInitial}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{adminBrandName}</span>
              </>
            )}
          </Link>
        </div>

        <div className="p-4">
          <AdminSidebar
            onNavigate={isMobile ? () => setSidebarOpen(false) : undefined}
          />
        </div>
      </aside>

      <div className="pt-16 min-h-screen">
        <main
          className={`min-h-full transition-all duration-300 ${
            sidebarOpen && !isMobile ? "ml-64" : "ml-0"
          }`}
        >
          <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-full overflow-x-hidden">
            <div className="mb-6">
              <AdminBreadcrumb />
            </div>

            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

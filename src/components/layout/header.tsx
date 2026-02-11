"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { usePublicCompany } from "@/hooks/use-company";
import { getResponsiveCompanyDisplay } from "@/lib/utils/company-name-utils";

// Skip navigation link for accessibility
function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
    >
      Skip to main content
    </a>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    label: "Services",
    href: "/services",
    isService: true,
    dropdown: [
      { href: "/services/bookkeeping", label: "Bookkeeping Services" },
      {
        href: "/services/accounts-receivable",
        label: "Accounts Receivable Management",
      },
      {
        href: "/services/accounts-payable",
        label: "Accounts Payable Management",
      },
      {
        href: "/services/financial-statements",
        label: "Financial Statements Preparation",
      },
      {
        href: "/services/forecasting-planning",
        label: "Forecasting & Financial Planning",
      },
      {
        href: "/services/invoice-quotation",
        label: "Invoice Preparation & Quotation Support",
      },
      {
        href: "/services/staff-recruitment",
        label: "Staff Recruitment for Overseas Clients",
      },
    ],
  },
  { href: "/jobs", label: "Jobs" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const pathname = usePathname();
  const { company } = usePublicCompany();

  const companyNames = getResponsiveCompanyDisplay(company?.name);
  const fallbackBrand = "mtbs.";
  const isServicesRoute = pathname.startsWith("/services");
  const isCurrentPath = (href: string) => pathname === href;

  return (
    <>
      <SkipNavigation />
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {company?.logo && (
              <Image
                src={company.logo}
                alt={company.name || "Company Logo"}
                width={120}
                height={32}
                className="h-8 w-auto max-w-[120px] object-contain"
                style={{ width: "auto" }}
                sizes="120px"
                priority
              />
            )}
            <div className="flex flex-col">
              <span className="hidden lg:block text-xl font-bold text-primary">
                {companyNames.full || fallbackBrand}
              </span>
              <span className="hidden md:block lg:hidden text-lg font-bold text-primary">
                {companyNames.short || fallbackBrand}
              </span>
              <span className="hidden sm:block md:hidden text-base font-bold text-primary">
                {companyNames.mobile || fallbackBrand}
              </span>
              <span className="block sm:hidden text-sm font-bold text-primary">
                {companyNames.initials || "C"}
              </span>
            </div>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const isActive = link.isService
                ? isServicesRoute
                : isCurrentPath(link.href);

              if (link.dropdown) {
                return (
                  <DropdownMenu key={link.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-10 rounded-full px-4 text-sm font-semibold",
                          isActive
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "text-foreground hover:bg-accent/60 hover:text-primary"
                        )}
                        aria-label="Open services menu"
                      >
                        <span className="flex items-center gap-1.5">
                          {link.label}
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-72 p-2">
                      <DropdownMenuItem asChild>
                        <Link
                          href={link.href}
                          prefetch={false}
                          aria-current={isServicesRoute ? "page" : undefined}
                          className={cn(
                            "rounded-md px-2 py-2 font-medium",
                            isServicesRoute && "text-primary"
                          )}
                        >
                          All Services
                        </Link>
                      </DropdownMenuItem>
                      {link.dropdown.map((item) => (
                        <DropdownMenuItem key={item.label} asChild>
                          <Link
                            href={item.href}
                            prefetch={false}
                            aria-current={pathname === item.href ? "page" : undefined}
                            className={cn(
                              "rounded-md px-2 py-2",
                              pathname === item.href && "text-primary"
                            )}
                          >
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent/60 hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex rounded-full px-5 font-semibold"
            >
              <Link href="/contact">Talk to Us</Link>
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 sm:w-[360px]">
                <div className="flex h-full flex-col">
                  <div className="border-b px-6 py-5">
                    <Link
                      href="/"
                      className="flex items-center gap-3 font-semibold"
                      onClick={closeMobileMenu}
                    >
                      {company?.logo && (
                        <Image
                          src={company.logo}
                          alt={company.name || "Company Logo"}
                          width={120}
                          height={32}
                          className="h-8 w-auto max-w-[120px] object-contain"
                          style={{ width: "auto" }}
                          sizes="120px"
                        />
                      )}
                      <span className="text-xl font-bold text-primary">
                        {companyNames.mobile || fallbackBrand}
                      </span>
                    </Link>
                  </div>

                  <nav className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="grid gap-2">
                      {navLinks.map((link) =>
                        link.dropdown ? (
                          <Collapsible
                            key={link.label}
                            defaultOpen={isServicesRoute}
                            className="rounded-xl border bg-card/80"
                          >
                            <CollapsibleTrigger className="group w-full">
                              <div
                                className={cn(
                                  "flex min-h-[48px] items-center justify-between px-4 py-3 text-left text-base font-semibold transition-colors",
                                  isServicesRoute
                                    ? "text-primary"
                                    : "text-foreground"
                                )}
                              >
                                <span>{link.label}</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="grid gap-1 border-t px-2 py-2">
                                <Link
                                  href={link.href}
                                  prefetch={false}
                                  aria-current={isServicesRoute ? "page" : undefined}
                                  className={cn(
                                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isServicesRoute
                                      ? "bg-primary/10 text-primary"
                                      : "text-muted-foreground hover:bg-accent/60 hover:text-primary"
                                  )}
                                  onClick={closeMobileMenu}
                                >
                                  All Services
                                </Link>
                                {link.dropdown.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    prefetch={false}
                                    aria-current={pathname === item.href ? "page" : undefined}
                                    className={cn(
                                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                      pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-primary"
                                    )}
                                    onClick={closeMobileMenu}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <Link
                            key={link.label}
                            href={link.href}
                            aria-current={isCurrentPath(link.href) ? "page" : undefined}
                            className={cn(
                              "rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                              isCurrentPath(link.href)
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-accent/60 hover:text-primary"
                            )}
                            onClick={closeMobileMenu}
                          >
                            {link.label}
                          </Link>
                        )
                      )}
                    </div>
                  </nav>

                  <div className="border-t px-6 py-5">
                    <Button asChild className="w-full rounded-full" size="lg">
                      <Link href="/contact" onClick={closeMobileMenu}>
                        Talk to Us
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

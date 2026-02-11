"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon,
  YoutubeIcon,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { usePublicCompany } from "@/hooks/use-company";
import { getResponsiveCompanyDisplay } from "@/lib/utils/company-name-utils";
import { Button } from "@/components/ui/button";

const services = [
  { name: "Bookkeeping Services", href: "/services/bookkeeping" },
  {
    name: "Accounts Receivable Management",
    href: "/services/accounts-receivable",
  },
  { name: "Accounts Payable Management", href: "/services/accounts-payable" },
  {
    name: "Financial Statements Preparation",
    href: "/services/financial-statements",
  },
  {
    name: "Forecasting & Financial Planning",
    href: "/services/forecasting-planning",
  },
  {
    name: "Invoice Preparation & Quotation Support",
    href: "/services/invoice-quotation",
  },
  {
    name: "Staff Recruitment for Overseas Clients",
    href: "/services/staff-recruitment",
  },
];

const quickLinks = [
  { name: "Apply Leave", href: "/apply-leave" },
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Jobs", href: "/jobs" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  const { company } = usePublicCompany();

  const companyNames = getResponsiveCompanyDisplay(company?.name);
  const companyPhone = company?.phone || "(555) 555-5555";
  const companyAddress =
    company?.address || "Street Address, Zip Code, City";
  const currentYear = new Date().getFullYear();
  const copyrightText = `© ${currentYear} ${
    company?.name || "Company Name"
  }. All rights reserved.`;

  const socialIcons = {
    twitter: TwitterIcon,
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    linkedin: LinkedinIcon,
    youtube: YoutubeIcon,
  };

  const activeSocialLinks =
    company?.socialLinks &&
    Object.entries(company.socialLinks).filter(
      ([platform, url]) =>
        Boolean(url) && platform in socialIcons
    );

  return (
    <footer className="relative z-10 mt-12 border-t border-border/80 bg-card/90 backdrop-blur">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-14">
        <div className="mb-12 rounded-2xl bg-primary px-6 py-7 text-primary-foreground shadow-lg md:px-8 md:py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/75">
                Start a Conversation
              </p>
              <h2 className="text-2xl font-bold md:text-3xl">
                Need dependable accounting support for your team?
              </h2>
              <p className="text-sm text-primary-foreground/85 md:text-base">
                Tell us what you need, and we&apos;ll help you choose the right
                service model.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full bg-white text-primary hover:bg-white/90"
              >
                <Link href="/contact">Book a Consultation</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href={`tel:${companyPhone.replace(/\s+/g, "")}`}>
                  Call Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-semibold transition-opacity hover:opacity-90"
            >
              {company?.logo && (
                <Image
                  src={company.logo}
                  alt={company.name || "Company Logo"}
                  width={150}
                  height={40}
                  className="h-10 w-auto max-w-[150px] object-contain"
                  style={{ width: "auto" }}
                  sizes="150px"
                />
              )}
              <div className="flex flex-col">
                <span className="hidden md:block text-2xl font-bold text-primary">
                  {companyNames.full || "mtbs."}
                </span>
                <span className="block md:hidden text-xl font-bold text-primary">
                  {companyNames.mobile || "mtbs."}
                </span>
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {company?.description ||
                "Reliable accounting, finance, and staffing services built for modern growing businesses."}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Contact Info
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {company?.phone && (
                <p>
                  <a
                    href={`tel:${company.phone}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {company.phone}
                  </a>
                </p>
              )}
              {!company?.phone && <p>{companyPhone}</p>}

              {company?.address && (
                <p className="mt-2 whitespace-pre-line">{company.address}</p>
              )}
              {!company?.address && <p className="mt-2">{companyAddress}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Services</h3>
            <div className="grid gap-2">
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  prefetch={false}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {service.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Quick Links
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                {(activeSocialLinks && activeSocialLinks.length > 0) ? (
                  activeSocialLinks.map(([platform, url]) => {
                    const IconComponent =
                      socialIcons[platform as keyof typeof socialIcons];

                    if (!IconComponent || !url) return null;

                    return (
                      <Link
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit our ${platform} page`}
                        className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        <IconComponent className="h-4 w-4" />
                      </Link>
                    );
                  })
                ) : (
                  <>
                    <span className="rounded-full border border-border/60 p-2 text-muted-foreground/60">
                      <TwitterIcon className="h-4 w-4" />
                    </span>
                    <span className="rounded-full border border-border/60 p-2 text-muted-foreground/60">
                      <FacebookIcon className="h-4 w-4" />
                    </span>
                    <span className="rounded-full border border-border/60 p-2 text-muted-foreground/60">
                      <InstagramIcon className="h-4 w-4" />
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{copyrightText}</p>
          <Button
            variant="ghost"
            size="sm"
            className="self-start rounded-full sm:self-auto"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
}

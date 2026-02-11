"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { usePublicCompany } from "@/hooks/use-company";

interface JobsCtaSectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  };
}

export function JobsCtaSection({ config }: JobsCtaSectionProps = {}) {
  const { company } = usePublicCompany();
  
  const careersEmail = company?.email || "careers@mtbs.com";
  
  return (
    <section
      className="py-16 md:py-20 lg:py-24 relative overflow-hidden"
      aria-labelledby="cta-section-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background"
        aria-hidden="true"
      ></div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
        aria-hidden="true"
      ></div>

      <div
        className="absolute top-10 left-10 w-24 h-24 bg-primary/5 rounded-full blur-xl"
        aria-hidden="true"
      ></div>
      <div
        className="absolute bottom-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
        aria-hidden="true"
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/3 rounded-full blur-lg"
        aria-hidden="true"
      ></div>

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h2
              id="cta-section-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline tracking-tight"
            >
              {config?.title || "Ready to Start Your Journey?"}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {config?.subtitle || 
                "Join a team that's passionate about simplifying tax management and financial services. We're looking for talented individuals who want to make a real impact."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="group transition-all duration-300 hover:shadow-lg hover:scale-105 px-8 py-6 text-lg min-h-[48px]"
            >
              <Link
                href={config?.ctaLink || "/contact"}
                aria-label="Contact us to get in touch about career opportunities"
              >
                <MessageCircle
                  className="mr-2 h-5 w-5 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
                {config?.ctaText || "Get in Touch"}
                <ArrowRight
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>

            {config?.secondaryCtaText && config?.secondaryCtaLink && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group transition-all duration-300 hover:shadow-md hover:border-primary/50 px-8 py-6 text-lg min-h-[48px]"
              >
                <Link href={config.secondaryCtaLink} aria-label={config.secondaryCtaText}>
                  <Building2
                    className="mr-2 h-5 w-5 transition-transform group-hover:scale-110"
                    aria-hidden="true"
                  />
                  {config.secondaryCtaText}
                </Link>
              </Button>
            )}
          </div>

          <div
            className="grid md:grid-cols-3 gap-6 mt-12"
            role="list"
            aria-label="Company highlights"
          >
            <div
              className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 text-center space-y-3 transition-all duration-300 hover:shadow-md hover:bg-card/70 focus-within:ring-2 focus-within:ring-primary/20"
              role="listitem"
            >
              <div
                className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Collaborative Culture</h3>
              <p className="text-sm text-muted-foreground">
                Work with passionate professionals in a supportive environment
              </p>
            </div>

            <div
              className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 text-center space-y-3 transition-all duration-300 hover:shadow-md hover:bg-card/70 focus-within:ring-2 focus-within:ring-primary/20"
              role="listitem"
            >
              <div
                className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Growing Company</h3>
              <p className="text-sm text-muted-foreground">
                Be part of our expansion and shape the future of financial
                services
              </p>
            </div>

            <div
              className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 text-center space-y-3 transition-all duration-300 hover:shadow-md hover:bg-card/70 focus-within:ring-2 focus-within:ring-primary/20"
              role="listitem"
            >
              <div
                className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Open Communication</h3>
              <p className="text-sm text-muted-foreground">
                Your ideas matter - we value feedback and innovation from all
                team members
              </p>
            </div>
          </div>

          <div
            className="bg-card/30 backdrop-blur-sm border rounded-lg p-6 mt-8"
            role="region"
            aria-labelledby="contact-info-heading"
          >
            <p id="contact-info-heading" className="text-muted-foreground mb-4">
              Have questions about our open positions or company culture?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <span className="flex items-center gap-2 min-h-[44px] sm:min-h-auto">
                <MessageCircle
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                Email us at{" "}
                <a
                  href={`mailto:${careersEmail}`}
                  className="text-primary hover:underline font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
                  aria-label={`Send email to ${careersEmail}`}
                >
                  {careersEmail}
                </a>
              </span>
              <span
                className="hidden sm:block text-muted-foreground"
                aria-hidden="true"
              >
                •
              </span>
              <span className="flex items-center gap-2 min-h-[44px] sm:min-h-auto">
                <Building2
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <Link
                  href="/contact"
                  className="text-primary hover:underline font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
                  aria-label="Visit our contact page for more information"
                >
                  Visit our contact page
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

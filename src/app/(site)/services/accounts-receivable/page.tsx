import { Suspense } from "react";
import Image from "next/image";
import { HybridPageService } from "@/lib/services/hybrid-page-service";
import { ContentUtils } from "@/lib/content-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, FileText, Handshake } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import type { ServiceDetail, ServiceHighlightItem, StatisticItem } from "@/lib/types/json-schemas";

export const revalidate = 300;

async function AccountsReceivablePageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("services");
  const servicesContent = dbContent || ContentUtils.getServicesPageContent();

  if (!servicesContent?.serviceDetails?.services) {
    return <FallbackAccountsReceivablePage />;
  }

  // Find the accounts-receivable service by ID
  const accountsReceivableService = servicesContent.serviceDetails.services.find(
    (service: ServiceDetail) => service.id === "accounts-receivable"
  );

  if (!accountsReceivableService) {
    return <FallbackAccountsReceivablePage />;
  }

  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={accountsReceivableService.image.imageUrl}
                alt={accountsReceivableService.image.description}
                fill
                className="object-cover"
                data-ai-hint={accountsReceivableService.image.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">
                  {accountsReceivableService.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  {accountsReceivableService.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {accountsReceivableService.description}
              </p>
              {accountsReceivableService.showStats && servicesContent.serviceStats?.statistics && (
                <div className="grid grid-cols-2 gap-8 pt-6">
                  {servicesContent.serviceStats.statistics.map((stat: StatisticItem) => (
                    <div key={stat.label} className="text-left">
                      <p className="text-4xl lg:text-5xl font-bold text-primary">
                        {stat.number}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {accountsReceivableService.showCta && accountsReceivableService.ctaText && accountsReceivableService.ctaLink && (
                <div>
                  <Button asChild size="lg" className="font-bold">
                    <Link href={accountsReceivableService.ctaLink}>{accountsReceivableService.ctaText}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="py-10 md:py-12 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {servicesContent.serviceHighlights?.items?.map((item: ServiceHighlightItem, index: number) => (
              <div key={index} className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 text-primary">
                  {item.icon === "Briefcase" && <Briefcase className="h-8 w-8" />}
                  {item.icon === "FileText" && <FileText className="h-8 w-8" />}
                  {item.icon === "Handshake" && <Handshake className="h-8 w-8" />}
                </div>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            )) || (
              // Fallback services if no highlights are available
              <>
                <div className="flex flex-col items-center gap-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <p className="text-muted-foreground">Hire a professional and take the stress out of taxes.</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="text-muted-foreground">Hire a professional and take the stress out of taxes.</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Handshake className="h-8 w-8 text-primary" />
                  <p className="text-muted-foreground">Hire a professional and take the stress out of taxes.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AccountsReceivablePage() {
  return (
    <Suspense fallback={<PageLoader text="Loading accounts receivable..." />}>
      <AccountsReceivablePageContent />
    </Suspense>
  );
}

function FallbackAccountsReceivablePage() {
  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/accounts-receivable-hero/300/300"
                alt="Invoice documents and customer management on professional desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">FINANCIAL MANAGEMENT</p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  Optimize your accounts receivable with professional collection services.
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Managing accounts receivable effectively is crucial for maintaining healthy cash flow.
                Our professional team handles invoicing, collection tracking, and customer account
                reconciliation. We help you reduce outstanding receivables, improve collection rates,
                and maintain positive customer relationships while ensuring your business stays
                financially strong.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    95
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Collection success rate
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    30
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Days average collection
                  </p>
                </div>
              </div>
              <div>
                <Button asChild size="lg" className="font-bold">
                  <Link href="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-10 md:py-12 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Professional invoicing and collection tracking services.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Customer account reconciliation and payment monitoring.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Handshake className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Improved cash flow and customer relationship management.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}





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

async function AccountsPayablePageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("services");
  const servicesContent = dbContent || ContentUtils.getServicesPageContent();

  if (!servicesContent?.serviceDetails?.services) {
    return <FallbackAccountsPayablePage />;
  }

  // Find the accounts-payable service by ID
  const accountsPayableService = servicesContent.serviceDetails.services.find(
    (service: ServiceDetail) => service.id === "accounts-payable"
  );

  if (!accountsPayableService) {
    return <FallbackAccountsPayablePage />;
  }

  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={accountsPayableService.image.imageUrl}
                alt={accountsPayableService.image.description}
                fill
                className="object-cover"
                data-ai-hint={accountsPayableService.image.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">
                  {accountsPayableService.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  {accountsPayableService.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {accountsPayableService.description}
              </p>
              {accountsPayableService.showStats && servicesContent.serviceStats?.statistics && (
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
              {accountsPayableService.showCta && accountsPayableService.ctaText && accountsPayableService.ctaLink && (
                <div>
                  <Button asChild size="lg" className="font-bold">
                    <Link href={accountsPayableService.ctaLink}>{accountsPayableService.ctaText}</Link>
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

export default function AccountsPayablePage() {
  return (
    <Suspense fallback={<PageLoader text="Loading accounts payable..." />}>
      <AccountsPayablePageContent />
    </Suspense>
  );
}

function FallbackAccountsPayablePage() {
  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/accounts-payable-hero/300/300"
                alt="Financial documents and payment processing on professional desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">FINANCIAL MANAGEMENT</p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  Streamline your accounts payable process with professional expertise.
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Managing accounts payable can be complex and time-consuming. Our professional team
                ensures accurate vendor payments, expense management, and optimal cash flow. We help
                you maintain strong vendor relationships while optimizing your financial operations
                and reducing the risk of errors or late payments.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    98
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Payment accuracy rate
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    24/7
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Payment monitoring
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
              <p className="text-muted-foreground">Professional vendor payment management and cash flow optimization.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Accurate expense tracking and financial reporting services.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Handshake className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Strong vendor relationships and timely payment processing.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



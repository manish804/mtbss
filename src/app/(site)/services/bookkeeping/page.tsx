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

async function BookkeepingPageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("services");
  const servicesContent = dbContent || ContentUtils.getServicesPageContent();

  if (!servicesContent?.serviceDetails?.services) {
    return <FallbackBookkeepingPage />;
  }

  // Find the bookkeeping service by ID
  const bookkeepingService = servicesContent.serviceDetails.services.find(
    (service: ServiceDetail) => service.id === "bookkeeping"
  );

  if (!bookkeepingService) {
    return <FallbackBookkeepingPage />;
  }

  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={bookkeepingService.image.imageUrl}
                alt={bookkeepingService.image.description}
                fill
                className="object-cover"
                data-ai-hint={bookkeepingService.image.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">
                  {bookkeepingService.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  {bookkeepingService.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {bookkeepingService.description}
              </p>
              {bookkeepingService.showStats && servicesContent.serviceStats?.statistics && (
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
              {bookkeepingService.showCta && bookkeepingService.ctaText && bookkeepingService.ctaLink && (
                <div>
                  <Button asChild size="lg" className="font-bold">
                    <Link href={bookkeepingService.ctaLink}>{bookkeepingService.ctaText}</Link>
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

export default function BookkeepingPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading bookkeeping..." />}>
      <BookkeepingPageContent />
    </Suspense>
  );
}

function FallbackBookkeepingPage() {
  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/bookkeeping-hero/300/300"
                alt="Financial ledgers and accounting documents on professional desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">FINANCIAL MANAGEMENT</p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  Accurate and professional bookkeeping services for your business.
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Professional bookkeeping is essential for maintaining accurate financial records and
                making informed business decisions. Our experienced team provides comprehensive
                bookkeeping services including transaction recording, account reconciliation, and
                financial reporting. We ensure your financial data is always up-to-date and
                compliant with accounting standards.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    100
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Accuracy rate
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    24/7
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Record monitoring
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
              <p className="text-muted-foreground">Accurate and timely recording of all financial transactions.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Comprehensive financial reporting and account reconciliation.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Handshake className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Professional bookkeeping services with guaranteed accuracy.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



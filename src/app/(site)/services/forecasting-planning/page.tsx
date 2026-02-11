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

async function ForecastingPlanningPageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("services");
  const servicesContent = dbContent || ContentUtils.getServicesPageContent();

  if (!servicesContent?.serviceDetails?.services) {
    return <FallbackForecastingPlanningPage />;
  }

  // Find the forecasting-planning service by ID
  const forecastingPlanningService = servicesContent.serviceDetails.services.find(
    (service: ServiceDetail) => service.id === "forecasting-planning"
  );

  if (!forecastingPlanningService) {
    return <FallbackForecastingPlanningPage />;
  }

  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={forecastingPlanningService.image.imageUrl}
                alt={forecastingPlanningService.image.description}
                fill
                className="object-cover"
                data-ai-hint={forecastingPlanningService.image.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">
                  {forecastingPlanningService.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  {forecastingPlanningService.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {forecastingPlanningService.description}
              </p>
              {forecastingPlanningService.showStats && servicesContent.serviceStats?.statistics && (
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
              {forecastingPlanningService.showCta && forecastingPlanningService.ctaText && forecastingPlanningService.ctaLink && (
                <div>
                  <Button asChild size="lg" className="font-bold">
                    <Link href={forecastingPlanningService.ctaLink}>{forecastingPlanningService.ctaText}</Link>
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

export default function ForecastingPlanningPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading forecasting & planning..." />}>
      <ForecastingPlanningPageContent />
    </Suspense>
  );
}

function FallbackForecastingPlanningPage() {
  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/forecasting-planning-hero/300/300"
                alt="Financial charts and planning documents on professional desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">STRATEGIC PLANNING</p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  Data-driven forecasting and financial planning for business growth.
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Strategic financial planning is essential for long-term business success. Our expert
                team provides comprehensive forecasting and financial planning services using
                data-driven insights. We help you make informed decisions, identify growth
                opportunities, and create realistic financial projections for sustainable business
                development.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    95
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Forecast accuracy
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    72
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Hour planning sessions
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
              <p className="text-muted-foreground">Data-driven insights to help businesses plan for the future.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Strategic financial planning and forecasting services.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Handshake className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Comprehensive business planning and growth strategies.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



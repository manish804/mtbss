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

async function StaffRecruitmentPageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("services");
  const servicesContent = dbContent || ContentUtils.getServicesPageContent();

  if (!servicesContent?.serviceDetails?.services) {
    return <FallbackStaffRecruitmentPage />;
  }

  // Find the staff-recruitment service by ID
  const staffRecruitmentService = servicesContent.serviceDetails.services.find(
    (service: ServiceDetail) => service.id === "staff-recruitment"
  );

  if (!staffRecruitmentService) {
    return <FallbackStaffRecruitmentPage />;
  }

  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={staffRecruitmentService.image.imageUrl}
                alt={staffRecruitmentService.image.description}
                fill
                className="object-cover"
                data-ai-hint={staffRecruitmentService.image.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">
                  {staffRecruitmentService.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  {staffRecruitmentService.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {staffRecruitmentService.description}
              </p>
              {staffRecruitmentService.showStats && servicesContent.serviceStats?.statistics && (
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
              {staffRecruitmentService.showCta && staffRecruitmentService.ctaText && staffRecruitmentService.ctaLink && (
                <div>
                  <Button asChild size="lg" className="font-bold">
                    <Link href={staffRecruitmentService.ctaLink}>{staffRecruitmentService.ctaText}</Link>
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

export default function StaffRecruitmentPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading staff recruitment..." />}>
      <StaffRecruitmentPageContent />
    </Suspense>
  );
}

function FallbackStaffRecruitmentPage() {
  return (
    <main>
      <div className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/staff-recruitment-hero/300/300"
                alt="Professional recruitment and hiring process on desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-primary font-semibold mb-2">HUMAN RESOURCES</p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  Professional staff recruitment services for overseas clients.
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Finding the right talent for your business is crucial for success. Our professional
                recruitment team specializes in sourcing and hiring skilled professionals tailored
                to your specific business needs. We handle the entire recruitment process from
                candidate sourcing to final placement, ensuring you get qualified professionals
                who fit your company culture and requirements.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    92
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Placement success rate
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    15
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Days average placement
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
              <p className="text-muted-foreground">Sourcing and hiring skilled professionals tailored to specific business needs.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Comprehensive recruitment process from sourcing to placement.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Handshake className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Professional candidates that fit your company culture and requirements.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



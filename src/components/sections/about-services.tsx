import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";
import { HybridPageService } from "@/lib/services/hybrid-page-service";

interface ImageData {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

interface ServiceItem {
  title: string;
  href: string;
  image?: ImageData;
}

interface ServiceDetailsItem {
  id: string;
  title: string;
  image?: ImageData;
}

interface AboutServicesSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    services?: ServiceItem[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

const defaultServices = [
  {
    title: "Book Keeping Services",
    href: "/services/bookkeeping",
    image: PlaceHolderImages.find((p) => p.id === "service-bookkeeping"),
  },
  {
    title: "Accounts Receivable Management",
    href: "/services/accounts-receivable",
    image: PlaceHolderImages.find(
      (p) => p.id === "service-accounts-receivable"
    ),
  },
  {
    title: "Accounts Payable Management",
    href: "/services/accounts-payable",
    image: PlaceHolderImages.find((p) => p.id === "service-accounts-payable"),
  },
  {
    title: "Financial Statements Preparation",
    href: "/services/financial-statements",
    image: PlaceHolderImages.find(
      (p) => p.id === "service-financial-statements"
    ),
  },
  {
    title: "Forecasting & Financial Planning",
    href: "/services/forecasting-planning",
    image: PlaceHolderImages.find(
      (p) => p.id === "service-forecasting-planning"
    ),
  },
  {
    title: "Invoice Preparation & Quotation Support",
    href: "/services/invoice-quotation",
    image: PlaceHolderImages.find((p) => p.id === "service-invoice-quotation"),
  },
  {
    title: "Staff Recruitment for Overseas Clients",
    href: "/services/staff-recruitment",
    image: PlaceHolderImages.find((p) => p.id === "service-staff-recruitment"),
  },
];

export default async function AboutServicesSection({
  content,
}: AboutServicesSectionProps) {
  let services = content?.services;

  if (!services || services.length === 0) {
    // Try to get services from the services page
    try {
      const servicesContent = await HybridPageService.getPageContent("services");
      if (servicesContent?.serviceDetails?.services) {
        services = servicesContent.serviceDetails.services.map((service: ServiceDetailsItem) => ({
          title: service.title,
          href: `/services/${service.id}`,
          image: service.image,
        }));
      }
    } catch (error) {
      console.warn("Failed to fetch services from services page:", error);
    }
  }

  // Fallback to default services if still no services
  if (!services) {
    services = defaultServices;
  }

  const title = content?.title || "We make the complex simple";
  const subtitle =
    content?.subtitle ||
    "We offer full tax, booking and accounting services, so you can focus on everything else in your business.";
  const description =
    content?.description ||
    "With our expertise and know-how, we'll help you save money, reduce stress, and focus on you're real priorities.";

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-12 md:py-24 lg:py-32",
  });

  return (
    <section id="about-services" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Services
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold font-headline"
              style={textStyles}
            >
              {title}
            </h2>
          </div>
          <div className="space-y-4">
            <p style={textStyles}>{subtitle}</p>
            <p style={textStyles}>{description}</p>
          </div>
        </div>

        <div className="mt-12 md:mt-20">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent >
              {services.map((service) => (
                <CarouselItem
                  key={service.title}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <Link href={service.href} className="group block h-full">
                    <article className="h-full rounded-2xl border border-border/70 bg-card/85 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md">
                      <div className="relative h-56 w-full overflow-hidden rounded-xl">
                        <Image
                          src={
                            service.image?.imageUrl ||
                            "https://picsum.photos/seed/placeholder/400/300"
                          }
                          alt={service.image?.description || service.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          data-ai-hint={service.image?.imageHint}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold transition-colors group-hover:text-primary">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        View service details
                      </p>
                    </article>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="z-20 hidden md:flex" />
            <CarouselNext className="z-20 hidden md:flex" />
          </Carousel>
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
            <Link href="/services">Explore All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

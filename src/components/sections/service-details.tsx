import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_CARD_CLASS, SECTION_CONTAINER_CLASS } from "@/lib/ui/layout-tokens";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface ImageData {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

interface ServiceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  features: string[];
  image: ImageData;
  layout: string;
  showStats?: boolean;
  showCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

interface ServiceDetailsSectionProps {
  content?: {
    services?: ServiceItem[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function ServiceDetailsSection({ content }: ServiceDetailsSectionProps) {
  const services = content?.services || [];

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-10 md:py-12",
  });

  if (services.length === 0) {
    return null;
  }

  return (
    <section id="service-details" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className={cn(SECTION_CONTAINER_CLASS, "relative z-10")}>
        <div className="space-y-20">
          {services.map((service) => (
            <article
              key={service.id}
              className={cn(
                "flex flex-col gap-12 p-6 md:items-start lg:gap-24 lg:p-8",
                SECTION_CARD_CLASS,
                service.layout === "image-left-text-right"
                  ? "md:flex-row-reverse"
                  : "md:flex-row"
              )}
            >
              <div className="w-full md:w-1/2">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                      {service.category}
                    </p>
                    <h2
                      className="text-3xl md:text-4xl font-bold font-headline"
                      style={textStyles}
                    >
                      {service.title}
                    </h2>
                    <p className="max-w-prose text-base leading-relaxed md:text-lg" style={textStyles}>
                      {service.description}
                    </p>
                  </div>
                  
                  {service.features.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4" style={textStyles}>
                        What&apos;s included:
                      </h3>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <span style={textStyles}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {service.showCta && service.ctaText && service.ctaLink && (
                    <div className="pt-4">
                      <Button asChild size="lg" className="font-bold">
                        <Link href={service.ctaLink}>{service.ctaText}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
               
              <div
                className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl self-start md:w-1/2"
              >
                <Image
                  src={service.image.imageUrl}
                  alt={service.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={service.image.imageHint}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

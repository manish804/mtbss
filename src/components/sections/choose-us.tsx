import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface StatisticItem {
  number: string;
  label: string;
}

interface ImageData {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

interface ChooseUsSectionProps {
  content?: {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: ImageData;
    statistics?: StatisticItem[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function ChooseUsSection({ content }: ChooseUsSectionProps) {
  const title = content?.title || "Choose us for trust, service and accuracy";
  const description = content?.description || 
    "We are a full service accounting firm specializing in tax and compliance. Everyone on our team has the professional qualifications required to give you the very best service and advice in all areas of personal and business tax.";
  const ctaText = content?.ctaText || "Our Services";
  const ctaLink = content?.ctaLink || "/#about-services";
  const statistics = content?.statistics || [];

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-10 md:py-12",
  });

  return (
    <section id="choose-us" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          {content?.image && (
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={content.image.imageUrl}
                alt={content.image.description}
                fill
                className="object-cover"
                data-ai-hint={content.image.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="space-y-8">
            <h2
              className="text-3xl md:text-4xl font-bold font-headline"
              style={textStyles}
            >
              {title}
            </h2>
            <p style={textStyles}>{description}</p>
            
            {statistics.length > 0 && (
              <div className="grid grid-cols-3 gap-6">
                {statistics.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {stat.number}
                    </div>
                    <div className="text-sm" style={textStyles}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {ctaText && ctaLink && (
              <div className="text-left">
                <Button asChild size="lg" className="font-bold">
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
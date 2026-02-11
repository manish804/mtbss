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

interface ImageData {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

interface TeamSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    teamImages?: ImageData[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function TeamSection({ content }: TeamSectionProps) {
  const title = content?.title || "Our professional team is here to help you with any questions or concerns. Learn more about your rights and requirements.";
  const subtitle = content?.subtitle || "Taxes are complicated. We strive to simplify the process so you have less stress and worries.";
  const ctaText = content?.ctaText || "Contact us";
  const ctaLink = content?.ctaLink || "/contact";
  const teamImages = content?.teamImages || [];

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
    <section id="team" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center space-y-6 mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold font-headline max-w-4xl mx-auto"
            style={textStyles}
          >
            {title}
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={textStyles}>
            {subtitle}
          </p>
        </div>
        
        {teamImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {teamImages.map((image) => (
              <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
              </div>
            ))}
          </div>
        )}
        
        {ctaText && ctaLink && (
          <div className="text-center">
            <Button asChild size="lg" className="font-bold">
              <Link href={ctaLink}>{ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
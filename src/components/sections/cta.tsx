import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SECTION_CONTAINER_CLASS, TRUST_BADGE_CLASS } from "@/lib/ui/layout-tokens";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface CallToActionSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    trustPoints?: string[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function CallToActionSection({
  content,
}: CallToActionSectionProps) {
  const title = content?.title || "Want more information?";
  const subtitle =
    content?.subtitle ||
    "Speak with our team to get a clear, practical plan for your business.";
  const ctaText = content?.ctaText || "Let's talk!";
  const ctaLink = content?.ctaLink || "/contact";
  const trustPoints =
    content?.trustPoints?.filter((point): point is string => Boolean(point)) ??
    [
      "Secure data handling",
      "13+ years of industry experience",
      "Fast response within 1 business day",
    ];

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#0ea5e9",
    textColor: migratedStyling?.textColor || "#ffffff",
    padding: migratedStyling?.padding || "py-12 md:py-16",
  });

  return (
    <section id="cta" className={cn(paddingClass)}>
      <div className={SECTION_CONTAINER_CLASS}>
        <div
          className="rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
          style={sectionStyles}
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold" style={textStyles}>
              {title}
            </h2>
            <p className="text-base md:text-lg opacity-95" style={textStyles}>
              {subtitle}
            </p>
            {trustPoints.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2 md:justify-start">
                {trustPoints.map((point) => (
                  <li key={point} className={TRUST_BADGE_CLASS} style={textStyles}>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 font-semibold flex-shrink-0"
          >
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

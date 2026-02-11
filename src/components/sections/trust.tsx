import Image from "next/image";
import { Check } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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

interface TrustSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: ImageData;
    features?: string[];
    statistics?: {
      number: string;
      label: string;
    }[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

const defaultFeatures = [
  "Trust",
  "Accuracy",
  "Confidentiality",
  "Expertise",
  "Experience",
  "Professional",
];

export default function TrustSection({ content }: TrustSectionProps) {
  const trustImage = PlaceHolderImages.find((p) => p.id === "trust-foundation");
  const title = content?.title || "Trust is the foundation of great service";
  const subtitle =
    content?.subtitle ||
    "We provide income tax, accounting and bookkeeping services to individuals, small businesses and corporate clients. Our services are tailored to the unique needs of each client. We work as part of your team, understanding your needs and what matters to you.";

  const features = content?.features || defaultFeatures;
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
    <section id="trust" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={
                content?.image?.imageUrl ||
                trustImage?.imageUrl ||
                "https://picsum.photos/seed/softax-trust/600/450"
              }
              alt={
                content?.image?.description ||
                trustImage?.description ||
                "A smiling woman in a professional office environment"
              }
              fill
              className="object-cover"
              data-ai-hint={
                content?.image?.imageHint ||
                trustImage?.imageHint
              }
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="space-y-8">
            <h2
              className="text-3xl md:text-4xl font-bold font-headline"
              style={textStyles}
            >
              {title}
            </h2>
            <p style={textStyles}>{subtitle}</p>
            
            {statistics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statistics.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold" style={textStyles}>
                      {stat.number}
                    </div>
                    <div className="text-sm" style={{ ...textStyles, opacity: 0.8 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {features.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4" style={textStyles}>
                  Features
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span style={textStyles}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* {ctaText && ctaLink && (
              <div className="text-left">
                <Button asChild size="lg" className="font-bold">
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </section>
  );
}

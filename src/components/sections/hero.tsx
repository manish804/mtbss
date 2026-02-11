"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";
import { usePublicCompany } from "@/hooks/use-company";

interface HeroSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: {
      id: string;
      description: string;
      imageUrl: string;
      imageHint: string;
    };
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function HeroSection({ content }: HeroSectionProps) {
  const { company } = usePublicCompany();

  const heroImage = PlaceHolderImages.find((p) => p.id === "hero-background");
  const title =
    content?.title ||
    (company?.name
      ? `Welcome to ${company.name}`
      : "We're pretty good with numbers.");
  const subtitle =
    content?.subtitle || "Accounting and finance support for modern teams";
  const description =
    content?.description ||
    company?.description ||
    "We'll handle all your tax and accounting needs, so you can focus on your business.";
  const ctaText = content?.ctaText || "Services";
  const ctaLink = content?.ctaLink || "#about-services";
  const imageUrl =
    content?.backgroundImage?.imageUrl ||
    heroImage?.imageUrl ||
    "https://picsum.photos/seed/softax-hero/1920/1080";
  const imageAlt =
    content?.backgroundImage?.description ||
    heroImage?.description ||
    "A modern office environment";
  const imageHint =
    content?.backgroundImage?.imageHint ||
    heroImage?.imageHint ||
    "technology office";

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#0ea5e9",
    textColor: migratedStyling?.textColor || "#ffffff",
    padding: migratedStyling?.padding || "py-20 px-4",
  });

  return (
    <section
      className={cn("relative isolate w-full overflow-hidden", paddingClass)}
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover object-center"
        data-ai-hint={imageHint}
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/45 to-primary/35" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
      <div className="container relative z-20 mx-auto flex min-h-[70vh] items-center px-4 md:px-6 lg:min-h-[76vh]">
        <div
          className="max-w-2xl rounded-3xl border border-white/20 bg-black/30 p-8 shadow-2xl backdrop-blur-md md:p-12"
          style={sectionStyles}
        >
          <p className="inline-flex items-center rounded-full border border-white/35 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            {subtitle}
          </p>
          <h1
            className="mt-5 text-4xl font-bold tracking-tight font-headline md:text-5xl lg:text-6xl"
            style={textStyles}
          >
            {title}
          </h1>
          <p
            className="mt-5 max-w-xl text-lg leading-relaxed opacity-95 md:text-xl"
            style={textStyles}
          >
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/50 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/contact">Get a Free Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

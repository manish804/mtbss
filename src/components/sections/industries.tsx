import Image from "next/image";
import {
  Hospital,
  Building2,
  Bike,
  Factory,
  Building,
  User,
  Heart,
  Home,
  Stethoscope,
} from "lucide-react";
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

interface IndustriesSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: ImageData;
    items?: {
      title: string;
      description: string;
      icon?: string;
    }[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

const iconMap = {
  Building: Building,
  User: User,
  Building2: Building2,
  Heart: Heart,
  Home: Home,
  Stethoscope: Stethoscope,
  Hospital: Hospital,
  Bike: Bike,
  Factory: Factory,
};

const fallbackIndustries = [
  {
    icon: <Hospital className="h-10 w-10 text-primary-foreground" />,
    name: "Medical",
    description: "Stay on top of the regulations that affect your business.",
  },
  {
    icon: <Building2 className="h-10 w-10 text-primary-foreground" />,
    name: "Real Estate",
    description: "Stay on top of the regulations that affect your business.",
  },
  {
    icon: <Bike className="h-10 w-10 text-primary-foreground" />,
    name: "Freelancers",
    description: "Stay on top of the regulations that affect your business.",
  },
  {
    icon: <Factory className="h-10 w-10 text-primary-foreground" />,
    name: "Manufacturing",
    description: "Stay on top of the regulations that affect your business.",
  },
];

export default function IndustriesSection({ content }: IndustriesSectionProps) {
  const industryImage = PlaceHolderImages.find(
    (p) => p.id === "industries-experts"
  );

  const title =
    content?.title || "We have experts in a range of industries including:";
  const subtitle =
    content?.subtitle ||
    "Our financial professionals will handle your entire tax portfolio, including business and personal accounts.";
  const industries =
    content?.items ||
    fallbackIndustries.map((industry) => ({
      title: industry.name,
      description: industry.description,
      icon:
        industry.name === "Medical"
          ? "Hospital"
          : industry.name === "Real Estate"
          ? "Building2"
          : industry.name === "Freelancers"
          ? "Bike"
          : "Factory",
    }));

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#0ea5e9",
    textColor: migratedStyling?.textColor || "#ffffff",
    padding: migratedStyling?.padding || "py-10 md:py-12",
  });

  return (
    <section id="industries" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-12">
            <h2
              className="text-3xl md:text-4xl font-bold font-headline"
              style={textStyles}
            >
              {title}
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
              {industries.slice(0, 4).map((industry, index) => {
                const IconComponent =
                  industry.icon &&
                  iconMap[industry.icon as keyof typeof iconMap];
                const fallbackIcon = fallbackIndustries[index]?.icon;

                return (
                  <div
                    key={industry.title}
                    className="flex flex-col items-start text-left gap-4"
                  >
                    {IconComponent ? (
                      <IconComponent className="h-10 w-10" style={textStyles} />
                    ) : (
                      fallbackIcon || (
                        <Building className="h-10 w-10" style={textStyles} />
                      )
                    )}
                    <h3 className="text-xl font-bold" style={textStyles}>
                      {industry.title}
                    </h3>
                    <p style={{ ...textStyles, opacity: 0.8 }}>
                      {industry.description}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* {ctaText && ctaLink && (
              <div className="text-left">
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold"
                >
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              </div>
            )} */}
          </div>
          <div className="space-y-6">
            <p className="text-lg" style={textStyles}>
              {subtitle}
            </p>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={
                  content?.image?.imageUrl ||
                  industryImage?.imageUrl ||
                  "https://picsum.photos/seed/softax-industries/600/450"
                }
                alt={
                  content?.image?.description ||
                  industryImage?.description ||
                  "Financial professionals working together"
                }
                fill
                className="object-cover"
                data-ai-hint={
                  content?.image?.imageHint ||
                  industryImage?.imageHint
                }
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/sections/contact-form";
import TestimonialSection from "@/components/sections/testimonial";
import { ContentUtils } from "@/lib/content-utils";
import { cn } from "@/lib/utils";
import { generateSectionStyles, migrateLegacyColors } from "@/lib/section-utils";
import { getPublicCompanyData } from "@/lib/services/public-company-service";
import type { PublicCompanyData } from "@/lib/types/company";

export const revalidate = 300;

export default async function ContactPage() {
  const [company, contactContent] = await Promise.all([
    getPublicCompanyData(),
    Promise.resolve(ContentUtils.getContactPageContent()),
  ]);

  if (!contactContent) {
    return <OriginalContactPage company={company} />;
  }

  const contactDetails = [
    {
      icon: <Phone className="h-6 w-6 text-primary-foreground" />,
      text: company?.phone || contactContent.contactInfo.phone,
    },
    {
      icon: <Mail className="h-6 w-6 text-primary-foreground" />,
      text: company?.email || contactContent.contactInfo.email,
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary-foreground" />,
      text: company?.address || contactContent.contactInfo.address,
    },
  ];

  const heroStyling = contactContent.hero.styling
    ? migrateLegacyColors(contactContent.hero.styling)
    : undefined;
  const heroStyles = generateSectionStyles({
    backgroundColor: heroStyling?.backgroundColor || "#ffffff",
    textColor: heroStyling?.textColor || "#000000",
    padding: heroStyling?.padding || "py-12 md:py-24",
    gradientDirection: heroStyling?.gradientDirection,
    buttonStyle: heroStyling?.buttonStyle,
    cardStyle: heroStyling?.cardStyle,
  });

  return (
    <section className={cn("relative", heroStyles.paddingClass)}>
      <div className="absolute inset-0" style={heroStyles.sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1
                className="text-4xl font-bold font-headline"
                style={heroStyles.textStyles}
              >
                {contactContent.hero.title}
              </h1>
              <p className="text-lg" style={heroStyles.textStyles}>
                {contactContent.hero.subtitle}
              </p>
            </div>
            <div className="space-y-6">
              {contactDetails.map((detail) => (
                <div key={detail.text} className="flex items-center gap-4">
                  <div className="bg-primary rounded-full h-12 w-12 flex items-center justify-center">
                    {detail.icon}
                  </div>
                  <p className="text-lg" style={heroStyles.textStyles}>
                    {detail.text}
                  </p>
                </div>
              ))}
              <div className="flex items-start gap-4">
                <div className="bg-primary rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-lg">
                  {contactContent.contactInfo.businessHours.map((bh) => (
                    <div
                      key={bh.days}
                      className="flex gap-4"
                      style={heroStyles.textStyles}
                    >
                      <span className="w-20">{bh.days}</span>
                      <span>{bh.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={heroStyles.textStyles}>
              {contactContent.form.title}
            </h2>
            <ContactForm styling={contactContent.form.styling} />
          </div>
        </div>
      </div>
    </section>
  );
}

function OriginalContactPage({ company }: { company: PublicCompanyData | null }) {
  const contactDetails = [
    {
      icon: <Phone className="h-6 w-6 text-primary-foreground" />,
      text: company?.phone || "(555) 555-5555",
    },
    {
      icon: <Mail className="h-6 w-6 text-primary-foreground" />,
      text: company?.email || "mymail@mailservice.com",
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary-foreground" />,
      text: company?.address || "Number, Street, City, State, Zip Code",
    },
  ];

  const businessHours = [
    { days: "Mon - Fri", hours: "9:00 am - 5:00 pm" },
    { days: "Sat - Sun", hours: "Closed" },
  ];

  return (
    <div>
      <div className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold font-headline">
                  {company?.name ? `Contact ${company.name}` : "Send us a message"}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Looking for help with your tax return or payroll? Or maybe
                  you&apos;re interested in full accounting services. Whatever
                  you need, we&apos;re here to help you get on with business.
                </p>
              </div>
              <div className="space-y-6">
                {contactDetails.map((detail) => (
                  <div key={detail.text} className="flex items-center gap-4">
                    <div className="bg-primary rounded-full h-12 w-12 flex items-center justify-center">
                      {detail.icon}
                    </div>
                    <p className="text-lg">{detail.text}</p>
                  </div>
                ))}
                <div className="flex items-start gap-4">
                  <div className="bg-primary rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-lg">
                    {businessHours.map((bh) => (
                      <div key={bh.days} className="flex gap-4">
                        <span className="w-20">{bh.days}</span>
                        <span>{bh.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                Tell us your details and we&apos;ll get right back to you.
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
      <TestimonialSection />
    </div>
  );
}

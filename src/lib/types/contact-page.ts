import { z } from "zod";
import { contactPageSchema } from "@/lib/validation/page-schemas";

export type ContactPageContent = z.infer<typeof contactPageSchema>;

export interface ContactHeroSection {
  title: string;
  subtitle?: string;
  styling: {
    backgroundColor?: string | string[];
    textColor?: string;
    padding?: string;
    gradientDirection?: "to-r" | "to-b" | "to-br" | "to-bl";
  };
}

export interface ContactInfoSection {
  phone: string;
  email: string;
  address: string;
  businessHours: Array<{
    days: string;
    hours: string;
  }>;
}

export interface ContactFormSection {
  title: string;
  styling: {
    backgroundColor?: string | string[];
    textColor?: string;
    padding?: string;
    cardStyle?: {
      backgroundColor?: string | string[];
      borderRadius?: string;
      padding?: string;
      shadowColor?: string;
    };
    buttonStyle?: {
      backgroundColor?: string | string[];
      textColor?: string;
      hoverBackgroundColor?: string | string[];
      size?: string;
      variant?: string;
    };
  };
}

export interface ContactTestimonialSection {
  enabled: boolean;
  styling: {
    backgroundColor?: string | string[];
    textColor?: string;
    padding?: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  serviceType?: string;
}

export interface ContactFormSubmissionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

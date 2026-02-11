"use client";

import type { ComponentProps } from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { handleContactForm } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { contactFormSubmissionSchema, type ContactFormSubmission } from "@/lib/validation/contact-form-schemas";
import { ContentUtils } from "@/lib/content-utils";
import { resolveBackgroundStyle } from "@/lib/section-utils";

interface ContactFormProps {
  styling?: {
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
    textColor?: string;
    backgroundColor?: string | string[];
  };
}

type ButtonSize = NonNullable<ComponentProps<typeof Button>["size"]>;
type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

const BUTTON_SIZES: ButtonSize[] = ["default", "sm", "lg", "icon"];
const BUTTON_VARIANTS: ButtonVariant[] = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
];

function isButtonSize(value: string): value is ButtonSize {
  return BUTTON_SIZES.includes(value as ButtonSize);
}

function isButtonVariant(value: string): value is ButtonVariant {
  return BUTTON_VARIANTS.includes(value as ButtonVariant);
}

export default function ContactForm({ styling }: ContactFormProps = {}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

 
  const contactContent = ContentUtils.getContactPageContent();
  const formConfig = contactContent?.form;
  const serviceOptions = formConfig?.fields?.serviceType?.options || [
    { value: "tax-preparation", label: "Tax Preparation" },
    { value: "payroll", label: "Payroll Services" },
    { value: "bookkeeping", label: "Bookkeeping" },
    { value: "business-setup", label: "Business Setup" },
    { value: "financial-planning", label: "Financial Planning" },
    { value: "other", label: "Other" },
  ];

  const form = useForm<ContactFormSubmission>({
    resolver: zodResolver(contactFormSubmissionSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      serviceType: "",
    },
  });

  function onSubmit(values: ContactFormSubmission) {
    startTransition(async () => {
      const result = await handleContactForm(values);
      if (result.success) {
        toast({
          title: "Message Sent!",
          description: formConfig?.notifications?.successMessage || 
            "Thank you for contacting us. We will get back to you shortly.",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.message || formConfig?.notifications?.errorMessage || 
            "There was an error submitting your message. Please try again.",
        });
      }
    });
  }

  // Apply styling classes
  const { backgroundClassName, backgroundStyle } = resolveBackgroundStyle(
    styling?.cardStyle?.backgroundColor
  );
  const cardClasses = [
    styling?.cardStyle?.shadowColor || "shadow-lg",
    styling?.cardStyle?.borderRadius || "",
    backgroundClassName,
  ].filter(Boolean).join(" ");

  const buttonSize: ButtonSize =
    styling?.buttonStyle?.size && isButtonSize(styling.buttonStyle.size)
      ? styling.buttonStyle.size
      : "lg";
  const buttonVariant: ButtonVariant =
    styling?.buttonStyle?.variant && isButtonVariant(styling.buttonStyle.variant)
      ? styling.buttonStyle.variant
      : "default";

  return (
    <Card className={cardClasses} style={backgroundStyle}>
      <CardContent className={`pt-6 ${styling?.cardStyle?.padding || ""}`}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
            aria-busy={isPending}
          >
            <p className="text-sm text-muted-foreground">
              Fields marked with * are required.
            </p>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name {formConfig?.fields?.name?.required && "*"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={formConfig?.fields?.name?.placeholder || "Your Name"} 
                      autoComplete="name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email {formConfig?.fields?.email?.required && "*"}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={formConfig?.fields?.email?.placeholder || "your.email@example.com"}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone {formConfig?.fields?.phone?.required ? "*" : "(Optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={formConfig?.fields?.phone?.placeholder || "(555) 123-4567"} 
                      autoComplete="tel"
                      inputMode="tel"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company {formConfig?.fields?.company?.required ? "*" : "(Optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={formConfig?.fields?.company?.placeholder || "Your Company Name"} 
                      autoComplete="organization"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service of Interest {formConfig?.fields?.serviceType?.required ? "*" : "(Optional)"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message {formConfig?.fields?.message?.required && "*"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={formConfig?.fields?.message?.placeholder || "Let us know how we can help..."}
                      {...field}
                      rows={formConfig?.fields?.message?.rows || 5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full font-bold"
              size={buttonSize}
              variant={buttonVariant}
              aria-describedby="contact-response-time"
            >
              {isPending 
                ? (formConfig?.submitButton?.loadingText || "Sending...") 
                : (formConfig?.submitButton?.text || "Send Message")
              }
            </Button>
            <p id="contact-response-time" className="text-center text-sm text-muted-foreground">
              We typically respond within one business day.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

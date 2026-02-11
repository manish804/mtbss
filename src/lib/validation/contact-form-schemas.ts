import { z } from "zod";

export const contactFormSubmissionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;

      const digitsOnly = val.replace(/\D/g, "");
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }, "Please enter a valid phone number (10-15 digits)"),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters")
    .refine(
      (val) => val.trim().length >= 10,
      "Message must contain at least 10 non-whitespace characters"
    ),
  serviceType: z.string().optional(),
});

export const contactFormConfigSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  fields: z
    .object({
      name: z
        .object({
          enabled: z.boolean(),
          required: z.boolean(),
          placeholder: z.string().optional(),
        })
        .optional(),
      email: z
        .object({
          enabled: z.boolean(),
          required: z.boolean(),
          placeholder: z.string().optional(),
        })
        .optional(),
      phone: z
        .object({
          enabled: z.boolean(),
          required: z.boolean(),
          placeholder: z.string().optional(),
        })
        .optional(),
      company: z
        .object({
          enabled: z.boolean(),
          required: z.boolean(),
          placeholder: z.string().optional(),
        })
        .optional(),
      message: z
        .object({
          enabled: z.boolean(),
          required: z.boolean(),
          placeholder: z.string().optional(),
          rows: z.number().min(2).max(10).optional(),
        })
        .optional(),
      serviceType: z
        .object({
          enabled: z.boolean(),
          required: z.boolean(),
          options: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  submitButton: z
    .object({
      text: z.string().min(1, "Submit button text is required"),
      loadingText: z.string().optional(),
    })
    .optional(),
  notifications: z
    .object({
      successMessage: z.string().optional(),
      errorMessage: z.string().optional(),
      emailNotifications: z
        .object({
          enabled: z.boolean(),
          recipients: z.array(z.string().email()).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type ContactFormSubmission = z.infer<typeof contactFormSubmissionSchema>;
export type ContactFormConfig = z.infer<typeof contactFormConfigSchema>;

"use server";

import {
  contactFormSubmissionSchema,
} from "@/lib/validation/contact-form-schemas";
import { ContactService } from "@/lib/services/contact-service";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();


const jobApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  resumeUrl: z.string().url("Please enter a valid resume URL"),
  coverLetter: z
    .string()
    .min(50, "Cover letter must be at least 50 characters"),
  linkedinProfile: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  portfolioWebsite: z
    .string()
    .url("Please enter a valid portfolio URL")
    .optional()
    .or(z.literal("")),
  
  currentCompany: z.string().optional(),
  currentPosition: z.string().optional(),
  experienceYears: z.number().optional(),
  expectedSalary: z.string().optional(),
});

export async function handleContactForm(data: unknown) {
  const parsedData = contactFormSubmissionSchema.safeParse(data);

  if (!parsedData.success) {
    const errors: Record<string, string> = {};
    parsedData.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      errors[field] = err.message;
    });
    return {
      success: false,
      message: "Please correct the errors in the form.",
      errors,
    };
  }

  
  const result = await ContactService.submitContactForm(parsedData.data);

  
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return result;
}

export async function handleJobApplication(data: unknown) {
  try {
    const parsedData = jobApplicationSchema.safeParse(data);

    if (!parsedData.success) {
      const errors: Record<string, string> = {};
      parsedData.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      return {
        success: false,
        message: "Please correct the errors in the form.",
        errors,
      };
    }

    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      resumeUrl,
      coverLetter,
      linkedinProfile,
      portfolioWebsite,
      currentCompany,
      currentPosition,
      experienceYears,
      expectedSalary,
    } = parsedData.data;

    
    const job = await prisma.jobOpening.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return {
        success: false,
        message: "Job opening not found.",
        errors: {},
      };
    }

    
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        firstName,
        lastName,
        email,
        phone,
        resumeUrl,
        coverLetter,
        linkedinProfile: linkedinProfile || null,
        portfolioWebsite: portfolioWebsite || null,
        currentCompany: currentCompany || null,
        currentPosition: currentPosition || null,
        experienceYears: experienceYears || null,
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
        status: "SUBMITTED",
        termsAccepted: true,
      },
    });

    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002";
    
    try {
      
      const applicantEmailData = {
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        jobTitle: job.title,
        jobId: job.id,
        currentCompany: application.currentCompany || "Not specified",
        currentPosition: application.currentPosition || "Not specified",
        experienceYears:
          application.experienceYears?.toString() || "Not specified",
        expectedSalary:
          application.expectedSalary?.toString() || "Not specified",
        coverLetter: application.coverLetter || "No cover letter provided",
        resumeUrl: application.resumeUrl || "Resume file attached",
        applicationId: application.id,
        submissionDate: application.createdAt.toISOString(),
      };

      const applicantEmailResponse = await fetch(
        `${baseUrl}/api/emails/job-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicantEmailData),
        }
      );

      if (!applicantEmailResponse.ok) {
        console.warn("Failed to send applicant confirmation email");
      }
    } catch (emailError) {
      console.warn("Failed to send applicant confirmation email:", emailError);
    }

    try {
      
      const employerEmailData = {
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        jobTitle: job.title,
        jobId: job.id,
        currentCompany: application.currentCompany || "Not specified",
        currentPosition: application.currentPosition || "Not specified",
        experienceYears:
          application.experienceYears?.toString() || "Not specified",
        expectedSalary:
          application.expectedSalary?.toString() || "Not specified",
        coverLetter: application.coverLetter || "No cover letter provided",
        resumeUrl: application.resumeUrl || "Resume file attached",
        applicationId: application.id,
        submissionDate: application.createdAt.toISOString(),
      };

      const employerEmailResponse = await fetch(
        `${baseUrl}/api/emails/job-application/receive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employerEmailData),
        }
      );

      if (!employerEmailResponse.ok) {
        console.warn("Failed to send employer notification email");
      }
    } catch (emailError) {
      console.warn("Failed to send employer notification email:", emailError);
    }

    return {
      success: true,
      message: "Application submitted successfully!",
      data: {
        applicationId: application.id,
        jobTitle: job.title,
      },
    };
  } catch (error) {
    console.error("Job application submission error:", error);
    return {
      success: false,
      message:
        "There was an error submitting your application. Please try again.",
      errors: {},
    };
  }
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JobContent } from "@/lib/content-types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleJobApplication } from "@/app/actions";

const applicationFormSchema = z.object({
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

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface JobApplicationModalProps {
  job: JobContent | null;
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function JobApplicationModal({
  job,
  jobId,
  isOpen,
  onClose,
}: JobApplicationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      jobId: jobId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      resumeUrl: "",
      coverLetter: "",
      linkedinProfile: "",
      portfolioWebsite: "",
      currentCompany: "",
      currentPosition: "",
      experienceYears: undefined,
      expectedSalary: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);

    try {
      const result = await handleJobApplication(data);

      if (result.success) {
        toast({
          title: "Application Submitted Successfully!",
          description: `Your application for ${job?.title} has been submitted. A confirmation email has been sent to ${data.email}.`,
          variant: "default",
        });

        form.reset({
          jobId: jobId,
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          resumeUrl: "",
          coverLetter: "",
          linkedinProfile: "",
          portfolioWebsite: "",
          currentCompany: "",
          currentPosition: "",
          experienceYears: undefined,
          expectedSalary: "",
        });
        onClose();
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as keyof ApplicationFormData, {
              type: "manual",
              message: message,
            });
          });
        }

        toast({
          title: "Submission Failed",
          description:
            result.message ||
            "There was an error submitting your application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);

      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white shadow-2xl p-4 md:p-6"
        aria-labelledby="application-modal-title"
        aria-describedby="application-modal-description"
      >
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-100 px-4 md:px-6">
          <DialogTitle
            id="application-modal-title"
            className="text-2xl font-bold text-gray-900 leading-tight"
          >
            Apply for {job.title}
          </DialogTitle>
          <DialogDescription
            id="application-modal-description"
            className="text-gray-600 text-base leading-relaxed"
          >
            Fill out the form below to submit your application. All fields
            marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 md:space-y-8 pt-4 md:pt-6 px-2 md:px-0"
            noValidate
            aria-label={`Job application form for ${job.title}`}
          >
            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                Personal Information
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          autoComplete="given-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          autoComplete="family-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                Resume <span className="text-red-500">*</span>
              </legend>

              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Resume URL <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://drive.google.com/file/d/your-resume-link or https://yourwebsite.com/resume.pdf"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                        type="url"
                        autoComplete="url"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      Please provide a direct link to your resume (Google Drive,
                      Dropbox, personal website, etc.)
                    </p>
                    <FormMessage className="text-red-600 text-sm font-medium" />
                  </FormItem>
                )}
              />
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                Cover Letter <span className="text-red-500">*</span>
              </legend>

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Tell us why you&apos;re interested in this position
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a brief cover letter explaining your interest in this position and relevant experience..."
                        className="min-h-[140px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm font-medium" />
                  </FormItem>
                )}
              />
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                Additional Information
                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="linkedinProfile"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        LinkedIn Profile
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          type="url"
                          autoComplete="url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioWebsite"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Portfolio/Website
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourportfolio.com"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          type="url"
                          autoComplete="url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentCompany"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Current Company
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your current employer"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentPosition"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Current Position
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your current job title"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Years of Experience
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 3"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedSalary"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Expected Salary
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., $80,000 or Negotiable"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm font-medium" />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors rounded-lg font-semibold min-h-[48px]"
                aria-label="Cancel application and close form"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "h-12 px-8 font-semibold rounded-lg transition-all duration-200 min-w-[180px] min-h-[48px]",
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                )}
                aria-label={
                  isSubmitting
                    ? "Submitting application, please wait"
                    : `Submit application for ${job.title}`
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <span>Submit Application</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ContactActionsProps {
  application: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    linkedinProfile?: string;
    job: {
      title: string;
      department: string;
    };
  };
  onContactLog?: (contactType: string, details: string) => void;
}

export function ContactActions({
  application,
  onContactLog,
}: ContactActionsProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const fullName = `${application.firstName} ${application.lastName}`;

  const emailTemplates = {
    acknowledgment: {
      subject: `Application Received - ${application.job.title} Position`,
      body: `Dear ${application.firstName},

Thank you for your interest in the ${application.job.title} position at our company. We have received your application and our team is currently reviewing it.

We will be in touch within the next few business days regarding the next steps in our hiring process.

If you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
[Your Name]
[Your Title]
[Company Name]`,
    },
    interview: {
      subject: `Interview Invitation - ${application.job.title} Position`,
      body: `Dear ${application.firstName},

We were impressed with your application for the ${application.job.title} position and would like to invite you for an interview.

Please let us know your availability for the following time slots:
- [Date/Time Option 1]
- [Date/Time Option 2]
- [Date/Time Option 3]

The interview will take approximately [duration] and will be conducted [in-person/virtually].

Please confirm your preferred time slot by replying to this email.

We look forward to speaking with you soon.

Best regards,
[Your Name]
[Your Title]
[Company Name]`,
    },
    followUp: {
      subject: `Follow-up on Your Application - ${application.job.title}`,
      body: `Dear ${application.firstName},

I hope this email finds you well. I wanted to follow up on your application for the ${application.job.title} position.

[Add specific follow-up message here]

Please feel free to reach out if you have any questions about the position or our hiring process.

Best regards,
[Your Name]
[Your Title]
[Company Name]`,
    },
    rejection: {
      subject: `Update on Your Application - ${application.job.title}`,
      body: `Dear ${application.firstName},

Thank you for your interest in the ${application.job.title} position and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.

We were impressed with your background and encourage you to apply for future opportunities that match your skills and experience.

Thank you again for your interest in our company.

Best regards,
[Your Name]
[Your Title]
[Company Name]`,
    },
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied to clipboard",
        description: `${field} has been copied to your clipboard.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const openEmailClient = (template: keyof typeof emailTemplates) => {
    const { subject, body } = emailTemplates[template];
    const mailtoUrl = `mailto:${application.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    onContactLog?.("email", `Email template: ${template}`);

    window.location.href = mailtoUrl;
    setEmailDialogOpen(false);
  };

  const openPhoneDialer = () => {
    if (application.phone) {
      onContactLog?.("phone", `Phone call initiated to ${application.phone}`);

      window.location.href = `tel:${application.phone}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contact Applicant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(application.email, "Email")}
            >
              {copiedField === "Email" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={application.email}
              readOnly
              className="flex-1 text-sm"
            />
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Email to {fullName}</DialogTitle>
                  <DialogDescription>
                    Choose an email template to send to the applicant. This will
                    open your default email client.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left"
                      onClick={() => openEmailClient("acknowledgment")}
                    >
                      <div>
                        <div className="font-medium">
                          Application Acknowledgment
                        </div>
                        <div className="text-sm text-gray-500">
                          Confirm receipt of application
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left"
                      onClick={() => openEmailClient("interview")}
                    >
                      <div>
                        <div className="font-medium">Interview Invitation</div>
                        <div className="text-sm text-gray-500">
                          Invite candidate for interview
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left"
                      onClick={() => openEmailClient("followUp")}
                    >
                      <div>
                        <div className="font-medium">Follow-up</div>
                        <div className="text-sm text-gray-500">
                          General follow-up message
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left"
                      onClick={() => openEmailClient("rejection")}
                    >
                      <div>
                        <div className="font-medium">Application Update</div>
                        <div className="text-sm text-gray-500">
                          Polite rejection message
                        </div>
                      </div>
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        const mailtoUrl = `mailto:${application.email}`;
                        window.location.href = mailtoUrl;
                        setEmailDialogOpen(false);
                        onContactLog?.("email", "Custom email opened");
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Open Email Client (Blank)
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {application.phone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(application.phone!, "Phone")}
              >
                {copiedField === "Phone" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={application.phone}
                readOnly
                className="flex-1 text-sm"
              />
              <Button variant="outline" size="sm" onClick={openPhoneDialer}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </div>
        )}

        {application.linkedinProfile && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">LinkedIn</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(application.linkedinProfile!, "LinkedIn")
                }
              >
                {copiedField === "LinkedIn" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={application.linkedinProfile}
                readOnly
                className="flex-1 text-sm"
              />
              <Button variant="outline" size="sm" asChild>
                <a
                  href={application.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    onContactLog?.("linkedin", "LinkedIn profile opened")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </a>
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const subject = `Quick Follow-up - ${application.job.title}`;
                const body = `Hi ${application.firstName},\n\nI wanted to quickly follow up on your application for the ${application.job.title} position.\n\n[Add your message here]\n\nBest regards,\n[Your Name]`;
                const mailtoUrl = `mailto:${
                  application.email
                }?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoUrl;
                onContactLog?.("email", "Quick follow-up email");
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Quick Email
            </Button>

            {application.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(application.phone!, "Phone number")
                }
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Phone
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(application.email, "Email address")
              }
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

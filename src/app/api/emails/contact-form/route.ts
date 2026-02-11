import { NextRequest, NextResponse } from "next/server";
import { contactFormSubmissionSchema } from "@/lib/validation/contact-form-schemas";
import { parseRecipientList, sendSmtpMail } from "@/lib/email/smtp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = contactFormSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;
    const recipients = parseRecipientList(
      process.env.CONTACT_FORM_TO,
      process.env.SMTP_TO,
      process.env.SMTP_USER
    );
    if (recipients.length === 0) {
      throw new Error("No contact form recipients configured");
    }

    const subject = `New Contact Form Submission: ${formData.name}`;
    const text = [
      "New contact form submission",
      "",
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "Not provided"}`,
      `Company: ${formData.company || "Not provided"}`,
      `Service: ${formData.serviceType || "Not specified"}`,
      "",
      "Message:",
      formData.message,
    ].join("\n");

    const result = await sendSmtpMail({
      to: recipients,
      subject,
      text,
      replyTo: formData.email,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error sending contact form email:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email. Please try again later.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sendSmtpMail } from "@/lib/email/smtp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "jobTitle",
      "applicationId",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    const submissionDate = body.submissionDate || new Date().toISOString();
    const result = await sendSmtpMail({
      to: body.email,
      subject: `Application Received: ${body.jobTitle}`,
      text: [
        `Hi ${body.firstName} ${body.lastName},`,
        "",
        "Thank you for your application.",
        "",
        `Application ID: ${body.applicationId}`,
        `Job Title: ${body.jobTitle}`,
        `Submitted On: ${new Date(submissionDate).toLocaleString()}`,
        "",
        "Our team will review your application and contact you if your profile matches our requirements.",
        "",
        "Best regards,",
        "HR Team",
      ].join("\n"),
    });

    return NextResponse.json({
      success: true,
      message: "Application confirmation email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error sending application confirmation email:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send confirmation email. Please try again later.",
      },
      { status: 500 }
    );
  }
}

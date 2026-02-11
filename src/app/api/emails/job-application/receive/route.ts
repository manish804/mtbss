import { NextRequest, NextResponse } from "next/server";
import { parseRecipientList, sendSmtpMail } from "@/lib/email/smtp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "jobTitle",
      "jobId",
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

    const recipients = parseRecipientList(
      process.env.JOB_APPLICATION_TO,
      process.env.SMTP_TO,
      process.env.SMTP_USER
    );
    if (recipients.length === 0) {
      throw new Error("No job application recipients configured");
    }

    const submissionDate = body.submissionDate || new Date().toISOString();

    const result = await sendSmtpMail({
      to: recipients,
      subject: `New Job Application: ${body.firstName} ${body.lastName} for ${body.jobTitle}`,
      text: [
        "A new job application has been submitted.",
        "",
        `Applicant: ${body.firstName} ${body.lastName}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone || "Not provided"}`,
        `Job Title: ${body.jobTitle}`,
        `Job ID: ${body.jobId || "N/A"}`,
        `Application ID: ${body.applicationId}`,
        `Submitted On: ${new Date(submissionDate).toLocaleString()}`,
        "",
        `Current Company: ${body.currentCompany || "Not specified"}`,
        `Current Position: ${body.currentPosition || "Not specified"}`,
        `Experience: ${body.experienceYears || "Not specified"}`,
        `Expected Salary: ${body.expectedSalary || "Not specified"}`,
        `Resume: ${body.resumeUrl || "Not attached"}`,
        "",
        "Cover Letter:",
        body.coverLetter || "No cover letter provided",
      ].join("\n"),
      replyTo: body.email,
    });

    return NextResponse.json({
      success: true,
      message: "Job application confirmation email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error sending job application confirmation email:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send confirmation email. Please try again later.",
      },
      { status: 500 }
    );
  }
}

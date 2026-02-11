import { NextRequest, NextResponse } from "next/server";
import { sendSmtpMail } from "@/lib/email/smtp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["employeeName", "email", "leaveType", "startDate", "endDate"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const totalDays = body.totalDays || "N/A";
    const isHalfDay = body.isHalfDay ? "Yes" : "No";
    const reason = body.reason || "Not specified";
    const rejectedBy = body.rejectedBy || "HR Department";
    const rejectionReason = body.rejectionReason || "No reason provided";

    const result = await sendSmtpMail({
      to: body.email,
      subject: `Leave Rejected: ${body.leaveType} (${body.startDate} to ${body.endDate})`,
      text: [
        `Hi ${body.employeeName},`,
        "",
        "Your leave request has been rejected.",
        "",
        `Leave Type: ${body.leaveType}`,
        `Start Date: ${body.startDate}`,
        `End Date: ${body.endDate}`,
        `Total Days: ${totalDays}`,
        `Half Day: ${isHalfDay}`,
        `Reason: ${reason}`,
        `Rejected By: ${rejectedBy}`,
        `Rejection Reason: ${rejectionReason}`,
        "",
        "Regards,",
        "HR Team",
      ].join("\n"),
    });
    return NextResponse.json({
      success: true,
      message: "Leave rejection email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error sending leave rejection email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send rejection email" },
      { status: 500 }
    );
  }
}

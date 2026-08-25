import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { smtpSettings, to, subject, text, html } = body;

    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      return NextResponse.json(
        { success: false, error: "SMTP settings (host, username, password) are required." },
        { status: 400 }
      );
    }

    if (!to || !subject || !text) {
      return NextResponse.json(
        { success: false, error: "Recipient email (to), subject, and body text are required." },
        { status: 400 }
      );
    }

    const portNumber = parseInt(String(smtpSettings.port || "587"), 10);
    const isSecure = portNumber === 465 || smtpSettings.encryption === "SSL";

    // Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host.trim(),
      port: portNumber,
      secure: isSecure,
      auth: {
        user: smtpSettings.username.trim(),
        pass: (smtpSettings.password || "").trim(),
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert handshake blocks
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
    });

    // Format From address
    const fromName = smtpSettings.fromName?.trim() || "FlowDesk Marketing";
    const fromEmail = smtpSettings.fromEmail?.trim() || smtpSettings.username.trim();
    const fromHeader = `"${fromName}" <${fromEmail}>`;

    // Send Mail
    const info = await transporter.sendMail({
      from: fromHeader,
      to: to.trim(),
      subject: subject.trim(),
      text: text.trim(),
      html: html || text.replace(/\n/g, "<br/>"),
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email successfully delivered to ${to}! Message ID: ${info.messageId}`,
      accepted: info.accepted,
    });
  } catch (error: any) {
    console.error("SMTP Transmission Error:", error);

    let helpfulHint = "";
    const errMsg = error.message || String(error);

    if (errMsg.includes("535") || errMsg.includes("Username and Password not accepted") || errMsg.includes("BadCredentials")) {
      helpfulHint = " • Hint: If using Gmail, Google requires a 16-character App Password instead of your regular password. Go to Google Account > Security > 2-Step Verification > App Passwords.";
    } else if (errMsg.includes("ETIMEDOUT") || errMsg.includes("ECONNREFUSED")) {
      helpfulHint = " • Hint: Connection timed out. Please check your SMTP Host and Port (Common ports: 587 for TLS, 465 for SSL).";
    }

    return NextResponse.json(
      {
        success: false,
        error: `SMTP Error: ${errMsg}${helpfulHint}`,
        details: errMsg,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { sanitizeEmail, sanitizeText } from "@/lib/security/sanitizer";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 25 email dispatches per minute per IP
    const rateLimit = checkRateLimit(req, "email_send", 25, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait a moment before sending more emails.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const { smtpSettings, to, subject, text, html } = body;

    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      return NextResponse.json(
        { success: false, error: "SMTP settings (host, username, password) are required." },
        { status: 400 }
      );
    }

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { success: false, error: "Recipient email (to), subject, and body text/html are required." },
        { status: 400 }
      );
    }

    // 2. Validate & Sanitize Recipient Email (Blocks CRLF injection)
    const { cleanEmail: cleanTo, isValid: isToValid } = sanitizeEmail(to);
    if (!isToValid) {
      return NextResponse.json(
        { success: false, error: `Invalid recipient email address: "${to}"` },
        { status: 400 }
      );
    }

    // 3. Sanitize Subject & From fields against SMTP Header Injection
    const cleanSubject = sanitizeText(subject, 200);
    if (!cleanSubject) {
      return NextResponse.json(
        { success: false, error: "Subject must not be empty after sanitization." },
        { status: 400 }
      );
    }

    const cleanFromName = sanitizeText(smtpSettings.fromName || "FlowDesk", 80);
    const rawFromEmail = smtpSettings.fromEmail || smtpSettings.username;
    const { cleanEmail: cleanFromEmail } = sanitizeEmail(rawFromEmail);

    // Limit body sizes to prevent memory exhaustion
    const cleanText = text ? String(text).slice(0, 100_000) : "";
    const cleanHtml = html ? String(html).slice(0, 150_000) : cleanText.replace(/\n/g, "<br/>");

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

    const fromHeader = `"${cleanFromName}" <${cleanFromEmail || smtpSettings.username.trim()}>`;

    // Send Mail
    const info = await transporter.sendMail({
      from: fromHeader,
      to: cleanTo,
      subject: cleanSubject,
      text: cleanText,
      html: cleanHtml,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email successfully delivered to ${cleanTo}!`,
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

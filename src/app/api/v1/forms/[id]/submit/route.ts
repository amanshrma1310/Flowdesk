import { NextRequest, NextResponse } from "next/server";
import { findFormAcrossAgencies, saveServerAgency, addLeadToServer, getAllAgencies } from "@/lib/serverStore";

function getPublicBaseUrl(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (host && !host.includes("0.0.0.0")) {
    return `${proto}://${host}`;
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      if (!u.host.includes("0.0.0.0")) return u.origin;
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("0.0.0.0")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  return "https://moccasin-viper-720799.hostingersite.com";
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let data: Record<string, any> = {};

    const contentType = req.headers.get("content-type") || "";
    const acceptHeader = req.headers.get("accept") || "";
    const isAjax = contentType.includes("application/json") || acceptHeader.includes("application/json");

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    }

    const leadName = data.name || data.fullName || data["Full Name"] || "Web Prospect";
    const leadPhone = data.phone || data.whatsApp || data["Phone Number"] || data["WhatsApp Number"] || "";
    const leadEmail = data.email || data.workEmail || data["Email Address"] || "";
    const leadCompany = data.company || data.businessName || data["Company Name"] || "";
    const leadNotes = data.notes || data.message || data.requirement || "";
    const redirectUrl = data.redirectUrl || data["redirect_url"] || "";

    const baseUrl = getPublicBaseUrl(req);

    if (!leadName && !leadPhone && !leadEmail) {
      if (isAjax) {
        return NextResponse.json(
          { success: false, error: "At least name, phone, or email is required." },
          { status: 400, headers: CORS_HEADERS }
        );
      } else {
        return NextResponse.redirect(`${baseUrl}/forms/public/${id}?error=missing_fields`, { status: 303 });
      }
    }

    // Extract any extra custom form fields
    const customFields: Record<string, string> = {};
    for (const [key, val] of Object.entries(data)) {
      if (!["name", "fullName", "Full Name", "phone", "whatsApp", "Phone Number", "WhatsApp Number", "email", "workEmail", "Email Address", "company", "businessName", "notes", "message", "redirectUrl", "redirect_url"].includes(key)) {
        customFields[key] = String(val);
      }
    }

    const customSummary = Object.entries(customFields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    // Look up the agency and form in shared server store
    const formMatch = findFormAcrossAgencies(id);
    let targetAgency = formMatch?.agency;
    let targetForm = formMatch?.form;

    if (!targetAgency) {
      const agencies = getAllAgencies();
      if (agencies.length > 0) {
        targetAgency = agencies[0];
      }
    }

    const newLeadId = `lead-${Date.now()}`;
    const newLead = {
      id: newLeadId,
      agencyId: targetAgency?.id || "org-1",
      name: leadName,
      company: leadCompany,
      email: leadEmail,
      phone: leadPhone,
      whatsApp: leadPhone,
      source: `Web Form: ${targetForm?.title || id}`,
      status: "New",
      notes: leadNotes ? `${leadNotes}${customSummary ? `\n\nCustom Fields: ${customSummary}` : ""}` : customSummary,
      customData: customFields,
      tags: ["Web Form", targetForm?.title || "Inbound Lead"],
      folderId: targetForm?.folderId,
      folderName: targetForm?.folderName || "Website Inbound",
      createdById: targetForm?.createdById || "system",
      createdByName: targetForm?.createdByName || "Website Lead Form",
      assignedEmployeeId: targetForm?.assignedEmployeeId || targetAgency?.adminId || "usr-1",
      assignedEmployeeName: targetForm?.assignedEmployeeName || targetAgency?.adminName || "Admin",
      activeWorkflowId: targetForm?.workflowId,
      activeWorkflowName: targetForm?.workflowName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          action: `Lead Captured via Web Form: ${targetForm?.title || id}`,
          channel: "System",
          details: `Submitted online from ${req.headers.get("referer") || "Website"}.${leadNotes ? ` Notes: ${leadNotes}` : ""}${customSummary ? ` [Custom Fields: ${customSummary}]` : ""}`,
          actor: "Web Form Ingestion",
        },
      ],
    };

    if (targetForm?.workflowId) {
      newLead.activities.unshift({
        id: `act-wf-${Date.now()}`,
        timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        action: `Enrolled in Workflow: ${targetForm.workflowName}`,
        channel: "Workflow",
        details: `Triggered automatically upon web form submission`,
        actor: "Automation Engine",
      });
    }

    // Persist into server storage (file-backed disk store)
    addLeadToServer(newLead, id);

    // Response handling
    const finalRedirectUrl = redirectUrl || targetForm?.redirectUrl;

    if (isAjax) {
      return NextResponse.json(
        {
          success: true,
          message: targetForm?.successMessage || "Thank you! We have received your inquiry.",
          redirectUrl: finalRedirectUrl || undefined,
          lead: newLead,
        },
        { headers: CORS_HEADERS }
      );
    }

    // If external redirect URL is configured, navigate visitor to it
    if (finalRedirectUrl && finalRedirectUrl.startsWith("http")) {
      return NextResponse.redirect(finalRedirectUrl, { status: 303 });
    }

    // Otherwise render a clean, self-contained Thank You confirmation page
    const referer = req.headers.get("referer") || "";
    const successTitle = "Thank You!";
    const successMsg = targetForm?.successMessage || "We have received your inquiry. Our team will contact you shortly.";
    const hasReferer = referer && !referer.includes("/api/v1/forms");

    const safeSuccessTitle = successTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSuccessMsg = successMsg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeReferer = referer.replace(/"/g, "&quot;");

    const thankYouHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You! - Inquiry Received</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      color: #f8fafc;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 44px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .icon-wrap {
      width: 68px;
      height: 68px;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid rgba(16, 185, 129, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #34d399;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      color: #ffffff;
    }
    p {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #4f46e5;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn:hover {
      background: #4338ca;
    }
    .subtext {
      margin-top: 20px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    </div>
    <h1>${safeSuccessTitle}</h1>
    <p>${safeSuccessMsg}</p>
    ${
      hasReferer
        ? `<a href="${safeReferer}" class="btn">← Return to Website</a>`
        : `<button onclick="window.history.back()" class="btn">← Return to Website</button>`
    }
    <div class="subtext">Your response has been securely saved.</div>
  </div>
</body>
</html>`;

    return new NextResponse(thankYouHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...CORS_HEADERS,
      },
    });
  } catch (err: any) {
    console.error("Form Ingestion Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Submission failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

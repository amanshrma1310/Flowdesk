import { NextRequest, NextResponse } from "next/server";
import { findFormAcrossAgencies, serverAgencies, saveServerAgency } from "@/lib/serverStore";

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

    // Look up the agency and form in shared server memory
    const formMatch = findFormAcrossAgencies(id);
    let targetAgency = formMatch?.agency;
    let targetForm = formMatch?.form;

    if (!targetAgency && serverAgencies.size > 0) {
      targetAgency = Array.from(serverAgencies.values())[0];
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

    // Persist into server storage
    if (targetAgency) {
      targetAgency.leads = [newLead, ...(targetAgency.leads || [])];
      if (targetForm) {
        targetForm.submissionCount = (targetForm.submissionCount || 0) + 1;
      }
      saveServerAgency(targetAgency);
    }

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

    // Otherwise redirect to clean Thank You confirmation page with safe public base URL
    return NextResponse.redirect(`${baseUrl}/forms/public/${id}?submitted=true`, { status: 303 });
  } catch (err: any) {
    console.error("Form Ingestion Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Submission failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

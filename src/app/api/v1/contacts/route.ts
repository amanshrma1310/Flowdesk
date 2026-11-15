import { NextRequest, NextResponse } from "next/server";
import { getAllServerLeads, addLeadToServer, deleteLeadFromServer, deleteLeadsFromServer } from "@/lib/serverStore";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/security/sanitizer";

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, "contacts_get", 100, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const agencyCode = searchParams.get("agencyCode") || searchParams.get("joinCode") || "";

  const leads = getAllServerLeads(agencyCode);

  return NextResponse.json({
    success: true,
    count: leads.length,
    contacts: leads,
    leads: leads,
  });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, "contacts_post", 60, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    if (!body.name && !body.phone && !body.email) {
      return NextResponse.json({ success: false, error: "At least name, phone, or email is required" }, { status: 400 });
    }

    const cleanName = sanitizeText(body.name || "Web Contact", 100);
    const { cleanEmail } = sanitizeEmail(body.email || "");
    const cleanPhoneVal = sanitizePhone(body.phone || body.whatsApp || "");
    const cleanCompany = sanitizeText(body.company || "", 120);
    const cleanNotes = sanitizeText(body.notes || "", 3000);
    const cleanSource = sanitizeText(body.source || "Direct API Inbound", 80);

    const newLead = {
      id: body.id || `lead-${Date.now()}`,
      agencyId: body.agencyId || "org-1",
      name: cleanName,
      company: cleanCompany,
      email: cleanEmail,
      phone: cleanPhoneVal,
      whatsApp: cleanPhoneVal,
      source: cleanSource,
      status: body.status || "New",
      notes: cleanNotes,
      photoUrl: body.photoUrl,
      photoType: body.photoType,
      tags: Array.isArray(body.tags) ? body.tags.map((t: any) => sanitizeText(String(t), 40)).filter(Boolean) : ["Inbound Lead"],
      folderId: body.folderId,
      folderName: body.folderName ? sanitizeText(body.folderName, 80) : undefined,
      createdById: body.createdById || "system",
      createdByName: body.createdByName || "Inbound API",
      assignedEmployeeId: body.assignedEmployeeId,
      assignedEmployeeName: body.assignedEmployeeName,
      activeWorkflowId: body.activeWorkflowId,
      activeWorkflowName: body.activeWorkflowName,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          action: "Lead Captured via API",
          channel: "System",
          details: `Source: ${cleanSource}`,
          actor: "API Ingestion",
        },
      ],
    };

    const { lead } = addLeadToServer(newLead);

    return NextResponse.json({
      success: true,
      message: "Lead successfully ingested and saved into database",
      contact: lead,
      lead: lead,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, "contacts_delete", 60, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const { id, ids } = body;
    if (id) {
      deleteLeadFromServer(id);
      return NextResponse.json({ success: true, message: `Lead ${id} deleted successfully` });
    }
    if (ids && Array.isArray(ids)) {
      deleteLeadsFromServer(ids);
      return NextResponse.json({ success: true, message: `${ids.length} leads deleted successfully` });
    }
    return NextResponse.json({ success: false, error: "Missing id or ids in request body" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

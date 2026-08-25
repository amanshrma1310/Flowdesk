import { NextRequest, NextResponse } from "next/server";
import { getAllServerLeads, addLeadToServer, getAgencyByJoinCode } from "@/lib/serverStore";

export async function GET(req: NextRequest) {
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
    const body = await req.json();
    if (!body.name && !body.phone && !body.email) {
      return NextResponse.json({ success: false, error: "At least name, phone, or email is required" }, { status: 400 });
    }

    const newLead = {
      id: body.id || `lead-${Date.now()}`,
      agencyId: body.agencyId || "org-1",
      name: body.name || "Web Contact",
      company: body.company || "",
      email: body.email || "",
      phone: body.phone || body.whatsApp || "",
      whatsApp: body.whatsApp || body.phone || "",
      source: body.source || "Direct API Inbound",
      status: body.status || "New",
      notes: body.notes || "",
      tags: body.tags || ["Inbound Lead"],
      folderId: body.folderId,
      folderName: body.folderName,
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
          details: `Source: ${body.source || "Inbound API"}`,
          actor: "API Ingestion",
        },
      ],
    };

    const { lead, agency } = addLeadToServer(newLead);

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

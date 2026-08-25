import { NextResponse } from "next/server";
import { getAllAgencies, getAgencyByJoinCode, saveServerAgency } from "@/lib/serverStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const joinCode = searchParams.get("joinCode");

  if (joinCode) {
    const agency = getAgencyByJoinCode(joinCode);
    if (agency) {
      return NextResponse.json({ success: true, agency });
    }
    return NextResponse.json({ success: false, error: "Agency not found with this Agency ID" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    agencies: getAllAgencies(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agency, action, user, lead } = body;

    if (action === "CREATE_AGENCY" && agency) {
      const existing = getAgencyByJoinCode(agency.joinCode);
      const merged = {
        ...existing,
        ...agency,
        users: agency.users || existing?.users || [],
        leads: agency.leads && agency.leads.length > 0 ? agency.leads : (existing?.leads || []),
        forms: agency.forms || existing?.forms || [],
        workflows: agency.workflows || existing?.workflows || [],
        folders: agency.folders || existing?.folders || [],
        templates: agency.templates || existing?.templates || [],
      };
      saveServerAgency(merged);
      return NextResponse.json({ success: true, agency: merged });
    }

    if (action === "ADD_LEAD" && lead && agency) {
      const existing = getAgencyByJoinCode(agency.joinCode) || agency;
      const updatedLeads = [lead, ...(existing.leads || []).filter((l: any) => l.id !== lead.id)];
      existing.leads = updatedLeads;
      saveServerAgency(existing);
      return NextResponse.json({ success: true, lead, agency: existing });
    }

    if (agency && agency.joinCode) {
      const existing = getAgencyByJoinCode(agency.joinCode);
      const merged = {
        ...existing,
        ...agency,
        leads: agency.leads && agency.leads.length > 0 ? agency.leads : (existing?.leads || []),
      };
      saveServerAgency(merged);
      return NextResponse.json({ success: true, agency: merged });
    }

    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from "next/server";
import { getAllAgencies, getAgencyByJoinCode, saveServerAgency } from "@/lib/serverStore";
import { checkRateLimit } from "@/lib/security/rateLimiter";

/**
 * Strips confidential credentials (passwords, SMTP credentials, access tokens)
 * before returning agency objects to the client.
 */
function sanitizeAgencyForClient(agency: any): any {
  if (!agency) return agency;
  const clone = JSON.parse(JSON.stringify(agency));

  if (Array.isArray(clone.users)) {
    clone.users = clone.users.map((u: any) => {
      const { password, temporaryPassword, ...safeUser } = u;
      return safeUser;
    });
  }

  if (clone.smtpSettings) {
    const hasPassword = Boolean(clone.smtpSettings.password && String(clone.smtpSettings.password).trim().length > 0);
    const { password, ...safeSmtp } = clone.smtpSettings;
    clone.smtpSettings = {
      ...safeSmtp,
      hasPassword,
    };
  }

  if (clone.whatsAppSettings) {
    const hasToken = Boolean(clone.whatsAppSettings.accessToken && String(clone.whatsAppSettings.accessToken).trim().length > 0);
    const { accessToken, ...safeWa } = clone.whatsAppSettings;
    clone.whatsAppSettings = {
      ...safeWa,
      hasToken,
    };
  }

  return clone;
}

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, "agencies_get", 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const joinCode = searchParams.get("joinCode");

  if (joinCode) {
    const agency = getAgencyByJoinCode(joinCode);
    if (agency) {
      return NextResponse.json({
        success: true,
        agency: sanitizeAgencyForClient(agency),
      });
    }
    return NextResponse.json({ success: false, error: "Agency not found with this Agency ID" }, { status: 404 });
  }

  const rawAgencies = getAllAgencies();
  const safeAgencies = rawAgencies.map((ag) => sanitizeAgencyForClient(ag));

  return NextResponse.json({
    success: true,
    agencies: safeAgencies,
  });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, "agencies_post", 60, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const { agency, action, lead } = body;

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
        smtpSettings: agency.smtpSettings?.password
          ? agency.smtpSettings
          : { ...(agency.smtpSettings || {}), password: existing?.smtpSettings?.password || "" },
        whatsAppSettings: agency.whatsAppSettings?.accessToken
          ? agency.whatsAppSettings
          : { ...(agency.whatsAppSettings || {}), accessToken: existing?.whatsAppSettings?.accessToken || "" },
      };
      saveServerAgency(merged);
      return NextResponse.json({ success: true, agency: sanitizeAgencyForClient(merged) });
    }

    if (action === "ADD_LEAD" && lead && agency) {
      const existing = getAgencyByJoinCode(agency.joinCode) || agency;
      const updatedLeads = [lead, ...(existing.leads || []).filter((l: any) => l.id !== lead.id)];
      existing.leads = updatedLeads;
      saveServerAgency(existing);
      return NextResponse.json({ success: true, lead, agency: sanitizeAgencyForClient(existing) });
    }

    if (agency && agency.joinCode) {
      const existing = getAgencyByJoinCode(agency.joinCode);
      const merged = {
        ...existing,
        ...agency,
        leads: agency.leads && agency.leads.length > 0 ? agency.leads : (existing?.leads || []),
        smtpSettings: agency.smtpSettings?.password
          ? agency.smtpSettings
          : { ...(agency.smtpSettings || {}), password: existing?.smtpSettings?.password || "" },
        whatsAppSettings: agency.whatsAppSettings?.accessToken
          ? agency.whatsAppSettings
          : { ...(agency.whatsAppSettings || {}), accessToken: existing?.whatsAppSettings?.accessToken || "" },
      };
      saveServerAgency(merged);
      return NextResponse.json({ success: true, agency: sanitizeAgencyForClient(merged) });
    }

    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

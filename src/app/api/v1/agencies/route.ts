import { NextResponse } from "next/server";

// Server-side persistent agency store across all browser tabs & incognito windows
interface StoredAgency {
  id: string;
  name: string;
  joinCode: string;
  createdAt: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  users: any[];
  templates: any[];
  workflows: any[];
  leads: any[];
  folders: any[];
  campaigns: any[];
  responses: any[];
}

// Global server memory so all incognito tabs can resolve join codes
const globalAgencies = new Map<string, StoredAgency>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const joinCode = searchParams.get("joinCode");

  if (joinCode) {
    const cleanQuery = joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    for (const [code, agency] of globalAgencies.entries()) {
      if (code === cleanQuery || agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanQuery) {
        return NextResponse.json({ success: true, agency });
      }
    }
    return NextResponse.json({ success: false, error: "Agency not found with this join code" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    agencies: Array.from(globalAgencies.values()),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agency, action, user } = body;

    if (action === "CREATE_AGENCY" && agency) {
      const cleanCode = agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      globalAgencies.set(cleanCode, agency);
      return NextResponse.json({ success: true, agency });
    }

    if (action === "JOIN_AGENCY" && user && agency) {
      const cleanCode = agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const existing = globalAgencies.get(cleanCode) || agency;
      existing.users = [...(existing.users || []).filter((u: any) => u.email !== user.email), user];
      globalAgencies.set(cleanCode, existing);
      return NextResponse.json({ success: true, agency: existing, user });
    }

    if (agency && agency.joinCode) {
      const cleanCode = agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      globalAgencies.set(cleanCode, agency);
      return NextResponse.json({ success: true, agency });
    }

    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

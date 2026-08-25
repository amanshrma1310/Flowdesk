import { NextResponse } from "next/server";
import { cleanPhone, cleanEmail } from "@/lib/ai/dataCleaner";

export async function POST(req: Request) {
  try {
    const { rawRows } = await req.json();
    if (!rawRows || !Array.isArray(rawRows)) {
      return NextResponse.json({ success: false, error: "rawRows array required" }, { status: 400 });
    }

    const cleaned = rawRows.map((r, i) => ({
      id: `parsed-${i}`,
      name: r.name || r.Name || `Lead ${i + 1}`,
      phone: cleanPhone(String(r.phone || r.Phone || "")),
      email: cleanEmail(String(r.email || r.Email || "")),
      company: r.company || r.Company || "",
    }));

    return NextResponse.json({
      success: true,
      count: cleaned.length,
      leads: cleaned,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

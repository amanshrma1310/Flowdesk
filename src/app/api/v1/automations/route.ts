import { NextResponse } from "next/server";
import { MOCK_AUTOMATIONS } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: MOCK_AUTOMATIONS.length,
    automations: MOCK_AUTOMATIONS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Automation workflow created successfully",
      automation: {
        id: `auto-${Date.now()}`,
        ...body,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

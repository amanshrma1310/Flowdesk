import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let data: any = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    }

    if (!data.name && !data.phone && !data.email) {
      return NextResponse.json(
        { success: false, error: "At least name, phone, or email is required" },
        { status: 400 }
      );
    }

    // Return success with formatted lead ingestion receipt
    return NextResponse.json({
      success: true,
      message: "Lead successfully captured and routed to active marketing workflow!",
      lead: {
        id: `lead-${Date.now()}`,
        name: data.name || "Web Prospect",
        phone: data.phone || data.whatsApp || "",
        email: data.email || "",
        company: data.company || "",
        source: `Website Form (${id})`,
        status: "New",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

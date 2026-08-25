import { NextRequest, NextResponse } from "next/server";

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
    const leadPhone = data.phone || data.whatsApp || data["Phone Number"] || "";
    const leadEmail = data.email || data.workEmail || data["Email Address"] || "";
    const leadCompany = data.company || data.businessName || "";
    const leadNotes = data.notes || data.message || "";
    const redirectUrl = data.redirectUrl || data["redirect_url"] || "";

    if (!leadName && !leadPhone && !leadEmail) {
      if (isAjax) {
        return NextResponse.json(
          { success: false, error: "At least name, phone, or email is required." },
          { status: 400 }
        );
      } else {
        return NextResponse.redirect(
          new URL(`/forms/public/${id}?error=missing_fields`, req.url),
          { status: 303 }
        );
      }
    }

    // Lead capture response
    if (isAjax) {
      return NextResponse.json({
        success: true,
        message: "Thank you! We have received your inquiry.",
        redirectUrl: redirectUrl || undefined,
        lead: {
          id: `lead-${Date.now()}`,
          name: leadName,
          phone: leadPhone,
          email: leadEmail,
          company: leadCompany,
          source: `Website Form (${id})`,
          status: "New",
          createdAt: new Date().toISOString(),
        },
      });
    }

    // For standard browser HTML <form action="..." method="POST"> submissions:
    // If a custom welcome / thank you redirect URL was set, redirect to it!
    if (redirectUrl && redirectUrl.startsWith("http")) {
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    // Otherwise, redirect to the hosted Thank You confirmation card
    return NextResponse.redirect(
      new URL(`/forms/public/${id}?submitted=true`, req.url),
      { status: 303 }
    );
  } catch (err: any) {
    console.error("Form Ingestion Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Submission failed" }, { status: 500 });
  }
}

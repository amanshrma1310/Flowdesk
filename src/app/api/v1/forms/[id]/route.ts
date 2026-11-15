import { NextRequest, NextResponse } from "next/server";
import { findFormAcrossAgencies } from "@/lib/serverStore";
import { checkRateLimit } from "@/lib/security/rateLimiter";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimit = checkRateLimit(req, "public_form_get", 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429, headers: CORS_HEADERS });
  }

  const { id } = await params;
  const match = findFormAcrossAgencies(id);

  if (!match || !match.form) {
    return NextResponse.json(
      { success: false, error: "Form not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const f = match.form;

  // Return strictly public form schema — NO agency data, NO passwords, NO leads
  const safeForm = {
    id: f.id,
    title: f.title || "Inquiry Form",
    description: f.description || "",
    submitButtonText: f.submitButtonText || "Submit Inquiry",
    successMessage: f.successMessage || "Thank you! We have received your inquiry.",
    redirectUrl: f.redirectUrl || "",
    fields: f.fields || [],
    theme: f.theme,
    isActive: f.isActive !== false,
  };

  return NextResponse.json(
    { success: true, form: safeForm },
    { headers: CORS_HEADERS }
  );
}

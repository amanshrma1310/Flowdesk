import { NextResponse } from "next/server";
import { MOCK_CONTACTS } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: MOCK_CONTACTS.length,
    contacts: MOCK_CONTACTS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const newContact = {
      id: `cont-${Date.now()}`,
      name: body.name,
      phone: body.phone,
      email: body.email,
      company: body.company,
      source: body.source || "API_INBOUND",
      status: "NEW",
      leadScore: 70,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Contact created successfully and assigned to active sales round-robin",
      contact: newContact,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

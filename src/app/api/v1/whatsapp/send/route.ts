import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { whatsappSettings, to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number and message are required." },
        { status: 400 }
      );
    }

    if (!whatsappSettings || !whatsappSettings.phoneNumberId || !whatsappSettings.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp API is not configured. Please enter your Meta Phone Number ID and Access Token in Settings.",
        },
        { status: 400 }
      );
    }

    const cleanPhone = to.replace(/[^0-9]/g, "");
    const apiUrl = whatsappSettings.apiUrl || "https://graph.facebook.com/v20.0";
    const endpoint = `${apiUrl.replace(/\/$/, "")}/${whatsappSettings.phoneNumberId}/messages`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappSettings.accessToken.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: false,
          body: message.trim(),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.error?.message || JSON.stringify(data);
      let hint = "";
      if (data.error?.code === 190) {
        hint = " • Hint: Access token has expired or is invalid. Please generate a fresh token from Meta Developers console.";
      } else if (data.error?.code === 131030) {
        hint = " • Hint: Recipient phone number is not registered on WhatsApp or is not added to test recipient list.";
      }

      return NextResponse.json(
        {
          success: false,
          error: `Meta WhatsApp API Error: ${errMsg}${hint}`,
          details: data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `WhatsApp message successfully dispatched to +${cleanPhone}!`,
      data,
    });
  } catch (error: any) {
    console.error("WhatsApp Transmission Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Transmission Error: ${error.message || String(error)}`,
      },
      { status: 500 }
    );
  }
}

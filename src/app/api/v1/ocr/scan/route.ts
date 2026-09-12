import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { parseBusinessCardText } from "@/lib/ocrCardParser";

export const maxDuration = 30; // Allow sufficient time for OCR processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image data (base64 or URL) is required" },
        { status: 400 }
      );
    }

    let imageInput: Buffer | string = image;

    // Handle base64 Data URL (e.g. data:image/jpeg;base64,...)
    if (typeof image === "string") {
      if (image.startsWith("data:")) {
        const base64Data = image.split(",")[1] || image;
        imageInput = Buffer.from(base64Data, "base64");
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        const fetchRes = await fetch(image);
        const arrayBuf = await fetchRes.arrayBuffer();
        imageInput = Buffer.from(arrayBuf);
      }
    }

    console.log("[OCR API] Starting OCR character recognition on uploaded card...");
    const ocrResult = await Tesseract.recognize(imageInput, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          // progress tracking
        }
      },
    });

    const rawText = ocrResult?.data?.text || "";
    console.log("[OCR API] Raw text recognized:", rawText.slice(0, 100));

    // Extract structured business card information using our intelligent parser
    const parsed = parseBusinessCardText(rawText);

    return NextResponse.json({
      success: true,
      rawText,
      confidence: ocrResult?.data?.confidence || 0,
      data: parsed,
    });
  } catch (err: any) {
    console.error("[OCR API] Error running OCR:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process image with OCR",
      },
      { status: 500 }
    );
  }
}

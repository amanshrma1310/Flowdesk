import { NextRequest, NextResponse } from "next/server";
import { scanBusinessCardImage } from "@/lib/ocrEngine";

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

    let imageBuffer: Buffer;

    // Handle base64 Data URL (e.g. data:image/jpeg;base64,...)
    if (typeof image === "string") {
      if (image.startsWith("data:")) {
        const base64Data = image.split(",")[1] || image;
        imageBuffer = Buffer.from(base64Data, "base64");
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        const fetchRes = await fetch(image);
        const arrayBuf = await fetchRes.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      } else {
        imageBuffer = Buffer.from(image, "base64");
      }
    } else {
      imageBuffer = Buffer.from(image);
    }

    console.log(`[OCR API] Processing card image (${imageBuffer.length} bytes)...`);
    const ocrResult = await scanBusinessCardImage(imageBuffer);

    return NextResponse.json({
      success: ocrResult.success,
      confidence: ocrResult.confidence,
      durationMs: ocrResult.durationMs,
      rawText: ocrResult.rawText,
      data: ocrResult.data,
      error: ocrResult.error,
    });
  } catch (err: any) {
    console.error("[OCR API] Error in scan endpoint:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process image with OCR",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { scanBusinessCardImage } from "@/lib/ocrEngine";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { validateUploadedImage } from "@/lib/security/fileValidator";
import { isSafeRemoteUrl } from "@/lib/security/ssrf";

export const maxDuration = 30; // Allow sufficient time for OCR processing

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 20 OCR scans per minute per client IP
    const rateLimit = checkRateLimit(req, "ocr_scan", 20, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many card scan requests. Please wait a moment before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image data (base64 or URL) is required" },
        { status: 400 }
      );
    }

    let imageBuffer: Buffer;

    // Handle base64 Data URL or remote URL
    if (typeof image === "string") {
      if (image.startsWith("data:")) {
        const base64Data = image.split(",")[1] || image;
        // Approximate byte size check before allocation (base64 length * 0.75)
        if (base64Data.length * 0.75 > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { success: false, error: "Payload exceeds 10MB limit." },
            { status: 413 }
          );
        }
        imageBuffer = Buffer.from(base64Data, "base64");
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        // 2. SSRF Protection: Block private IPs, localhost, and cloud metadata endpoints
        const ssrfCheck = isSafeRemoteUrl(image);
        if (!ssrfCheck.safe) {
          return NextResponse.json(
            { success: false, error: ssrfCheck.error || "Forbidden image URL." },
            { status: 400 }
          );
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const fetchRes = await fetch(image, {
          signal: controller.signal,
          headers: { "User-Agent": "FlowDesk-Secure-OCR/2.0" },
        });
        clearTimeout(timeout);

        if (!fetchRes.ok) {
          return NextResponse.json(
            { success: false, error: `Failed to retrieve remote image: HTTP ${fetchRes.status}` },
            { status: 400 }
          );
        }

        const contentLength = parseInt(fetchRes.headers.get("content-length") || "0", 10);
        if (contentLength > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { success: false, error: "Remote image exceeds 10MB size limit." },
            { status: 413 }
          );
        }

        const arrayBuf = await fetchRes.arrayBuffer();
        if (arrayBuf.byteLength > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { success: false, error: "Remote image exceeds 10MB size limit." },
            { status: 413 }
          );
        }
        imageBuffer = Buffer.from(arrayBuf);
      } else {
        imageBuffer = Buffer.from(image, "base64");
      }
    } else {
      imageBuffer = Buffer.from(image);
    }

    // 3. Strict Magic Byte & Malware/Virus Protection
    const validation = validateUploadedImage(imageBuffer, MAX_IMAGE_BYTES);
    if (!validation.valid) {
      console.warn(`[Security Alert] Rejected invalid/malicious file upload from IP ${rateLimit.ip}: ${validation.error}`);
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Invalid file format.",
        },
        { status: 400 }
      );
    }

    console.log(`[OCR API] Processing authentic ${validation.format?.toUpperCase()} card image (${imageBuffer.length} bytes)...`);
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
        error: err.name === "AbortError" ? "Image download timed out." : (err.message || "Failed to process image"),
      },
      { status: 500 }
    );
  }
}

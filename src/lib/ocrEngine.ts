import path from "path";
import fs from "fs";
import sharp from "sharp";
import Tesseract from "tesseract.js";
import { parseBusinessCardText, ParsedCardData } from "./ocrCardParser";

// Global singleton worker to avoid re-initializing WebAssembly on every request
declare global {
  // eslint-disable-next-line no-var
  var __flowdesk_ocr_worker: any | undefined;
}

function getTessdataPath(): string {
  // 1. Check public/tessdata
  const publicPath = path.join(process.cwd(), "public", "tessdata");
  if (fs.existsSync(path.join(publicPath, "eng.traineddata"))) {
    return publicPath;
  }
  // 2. Check root directory
  if (fs.existsSync(path.join(process.cwd(), "eng.traineddata"))) {
    return process.cwd();
  }
  return publicPath;
}

async function getWarmWorker(): Promise<any> {
  if (global.__flowdesk_ocr_worker) {
    return global.__flowdesk_ocr_worker;
  }

  const tessdataPath = getTessdataPath();
  console.log("[OCREngine] Initializing warm Tesseract worker with local langPath:", tessdataPath);

  try {
    const worker = await Tesseract.createWorker("eng", 1, {
      langPath: tessdataPath,
      cachePath: tessdataPath,
      logger: () => {}, // Suppress verbose log spam
    });

    global.__flowdesk_ocr_worker = worker;
    return worker;
  } catch (err) {
    console.error("[OCREngine] Failed to initialize persistent worker:", err);
    throw err;
  }
}

/**
 * Fast single-stage card preprocessing for sub-second execution on cloud servers:
 * 1. Auto-orient from EXIF
 * 2. High-quality Lanczos3 resize (width 1600px)
 * 3. Grayscale conversion
 * 4. Dynamic contrast normalization (stretches contrast between ink and card paper)
 * 5. Edge sharpening filter
 */
export async function preprocessCardImage(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const rotated = sharp(inputBuffer).rotate();
    const metadata = await rotated.metadata();

    const currentWidth = metadata.width || 1000;
    const targetWidth = Math.max(currentWidth, 1600);

    return await rotated
      .resize({
        width: targetWidth,
        withoutEnlargement: false,
        kernel: "lanczos3",
      })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.2, m1: 1.4, m2: 0.6 })
      .png()
      .toBuffer();
  } catch (err) {
    console.warn("[OCREngine] Preprocessing warning, using raw buffer:", err);
    return inputBuffer;
  }
}

export interface CardOcrResult {
  success: boolean;
  confidence: number;
  durationMs: number;
  rawText: string;
  data: ParsedCardData;
  error?: string;
}

/**
 * High-performance server-side OCR with sub-second execution to prevent Nginx 504 timeouts
 */
export async function scanBusinessCardImage(imageBuffer: Buffer): Promise<CardOcrResult> {
  const startTime = Date.now();

  try {
    const worker = await getWarmWorker();

    // Preprocess image
    const preprocessed = await preprocessCardImage(imageBuffer);
    const result = await worker.recognize(preprocessed);

    const rawText = result?.data?.text || "";
    const confidence = Math.round(result?.data?.confidence || 0);
    const parsed = parseBusinessCardText(rawText);

    // Check if real contact details were found
    const hasRealData = Boolean(
      (parsed.name &&
        !parsed.name.toLowerCase().startsWith("card lead") &&
        !parsed.name.toLowerCase().startsWith("card contact")) ||
      parsed.phone ||
      parsed.email
    );

    const durationMs = Date.now() - startTime;
    console.log(`[OCREngine] Server scan finished in ${durationMs}ms with confidence ${confidence}%. HasRealData: ${hasRealData}`);

    if (!hasRealData) {
      return {
        success: false,
        confidence,
        durationMs,
        rawText,
        data: {
          name: "",
          company: "",
          title: "",
          phone: "",
          whatsApp: "",
          email: "",
          website: "",
          address: "",
          notes: rawText ? `Unparsed card text:\n${rawText}` : "",
          rawText,
        },
        error: "No clear contact details detected on this image",
      };
    }

    return {
      success: true,
      confidence,
      durationMs,
      rawText,
      data: parsed,
    };
  } catch (err: any) {
    console.error("[OCREngine] OCR execution error:", err);
    return {
      success: false,
      confidence: 0,
      durationMs: Date.now() - startTime,
      rawText: "",
      data: parseBusinessCardText(""),
      error: err?.message || "Failed to recognize text from image",
    };
  }
}

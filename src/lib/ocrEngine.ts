import path from "path";
import fs from "fs";
import sharp from "sharp";
import Tesseract from "tesseract.js";
import { parseBusinessCardText, ParsedCardData } from "./ocrCardParser";

// Global singleton worker to avoid re-initializing WebAssembly on every request
declare global {
  // eslint-disable-next-line no-var
  var __flowdesk_ocr_worker: any | undefined;
  // eslint-disable-next-line no-var
  var __flowdesk_ocr_busy: boolean | undefined;
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
      logger: () => {}, // Suppress verbose log spam in production
    });

    // Configure OCR parameters for higher text recognition accuracy on cards
    try {
      await worker.setParameters({
        tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.-+&/:,()#'\"_ \n",
      });
    } catch {
      // Ignore parameter set failure if unsupported
    }

    global.__flowdesk_ocr_worker = worker;
    return worker;
  } catch (err) {
    console.error("[OCREngine] Failed to initialize persistent worker, will use fallback:", err);
    throw err;
  }
}

/**
 * Preprocess card image for maximum OCR accuracy:
 * 1. Auto-orient from EXIF
 * 2. Upscale small webcam resolutions to minimum 1800px width (Lanczos3)
 * 3. Convert to grayscale
 * 4. Histogram normalization (stretches contrast between faint ink and background)
 * 5. Unsharp mask filter (sharpens letter boundaries)
 */
export async function preprocessCardImage(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const img = sharp(inputBuffer);
    const metadata = await img.metadata();

    const currentWidth = metadata.width || 800;
    const targetWidth = Math.max(currentWidth, 1800);

    const pipeline = sharp(inputBuffer)
      .rotate() // Auto-orient
      .resize({
        width: targetWidth,
        withoutEnlargement: false,
        kernel: "lanczos3",
      })
      .grayscale()
      .normalize() // Stretch dynamic range
      .sharpen({ sigma: 1.2, m1: 1.4, m2: 0.6 });

    return await pipeline.png().toBuffer();
  } catch (err) {
    console.warn("[OCREngine] Preprocessing warning, falling back to raw buffer:", err);
    return inputBuffer;
  }
}

/**
 * Binarized threshold version for low-contrast / textured background cards
 */
export async function preprocessThresholdImage(inputBuffer: Buffer, threshold = 145): Promise<Buffer> {
  try {
    return await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: false, kernel: "lanczos3" })
      .grayscale()
      .threshold(threshold)
      .png()
      .toBuffer();
  } catch {
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
 * High-performance OCR business card recognition with multi-pass fallback
 */
export async function scanBusinessCardImage(imageBuffer: Buffer): Promise<CardOcrResult> {
  const startTime = Date.now();

  try {
    const worker = await getWarmWorker();

    // 1. Pass A: Enhanced Grayscale + Normalized + Sharpened
    const preprocessed = await preprocessCardImage(imageBuffer);
    const resultA = await worker.recognize(preprocessed);

    let rawText = resultA?.data?.text || "";
    let confidence = resultA?.data?.confidence || 0;

    // 2. Pass B: If confidence is low or text is very sparse, try threshold pass
    if (confidence < 45 || rawText.trim().length < 20) {
      try {
        const thresholded = await preprocessThresholdImage(imageBuffer, 140);
        const resultB = await worker.recognize(thresholded);
        const textB = resultB?.data?.text || "";
        const confB = resultB?.data?.confidence || 0;

        // If threshold pass found more text or higher confidence, use it or merge
        if (confB > confidence || (textB.length > rawText.length && confB > 35)) {
          rawText = textB;
          confidence = confB;
        } else if (textB.trim().length > 0) {
          // Merge unique lines
          const set = new Set(rawText.split("\n").map((l: string) => l.trim()).filter(Boolean));
          textB.split("\n").forEach((l: string) => {
            const trimmed = l.trim();
            if (trimmed && !set.has(trimmed)) set.add(trimmed);
          });
          rawText = Array.from(set).join("\n");
        }
      } catch (passBErr) {
        console.warn("[OCREngine] Threshold pass skipped:", passBErr);
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(`[OCREngine] Card recognized in ${durationMs}ms with confidence ${confidence}%`);

    // Parse structured card fields
    const parsed = parseBusinessCardText(rawText);

    return {
      success: true,
      confidence: Math.round(confidence),
      durationMs,
      rawText,
      data: parsed,
    };
  } catch (err: any) {
    console.error("[OCREngine] OCR execution error:", err);
    // Fallback: Return structured empty response with error
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

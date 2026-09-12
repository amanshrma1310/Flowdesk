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
 * Extract center region where user holds the business card in the camera viewfinder
 */
export async function extractCenterCard(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const img = sharp(inputBuffer);
    const metadata = await img.metadata();
    const w = metadata.width || 1280;
    const h = metadata.height || 720;

    // Viewfinder region: center 75% width, 70% height
    const cropWidth = Math.round(w * 0.75);
    const cropHeight = Math.round(h * 0.70);
    const left = Math.round((w - cropWidth) / 2);
    const top = Math.round((h - cropHeight) / 2);

    return await sharp(inputBuffer)
      .rotate()
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize({ width: 1800, withoutEnlargement: false, kernel: "lanczos3" })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.2, m1: 1.4, m2: 0.6 })
      .png()
      .toBuffer();
  } catch (err) {
    console.warn("[OCREngine] Center crop warning, returning full preprocessed:", err);
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
 * High-performance multi-pass OCR business card recognition
 */
export async function scanBusinessCardImage(imageBuffer: Buffer): Promise<CardOcrResult> {
  const startTime = Date.now();

  try {
    const worker = await getWarmWorker();

    // 1. Pass A: Center Viewfinder Crop (where cards are held in camera view)
    const centerBuffer = await extractCenterCard(imageBuffer);
    const resultCenter = await worker.recognize(centerBuffer);
    const textCenter = resultCenter?.data?.text || "";
    const parsedCenter = parseBusinessCardText(textCenter);

    // 2. Pass B: Full Image Preprocessed
    const fullBuffer = await preprocessCardImage(imageBuffer);
    const resultFull = await worker.recognize(fullBuffer);
    const textFull = resultFull?.data?.text || "";
    const parsedFull = parseBusinessCardText(textFull);

    // Score both passes to pick the one that actually found contact details
    const centerScore =
      (parsedCenter.name ? 3 : 0) +
      (parsedCenter.phone ? 4 : 0) +
      (parsedCenter.email ? 4 : 0) +
      (parsedCenter.company ? 2 : 0);

    const fullScore =
      (parsedFull.name ? 3 : 0) +
      (parsedFull.phone ? 4 : 0) +
      (parsedFull.email ? 4 : 0) +
      (parsedFull.company ? 2 : 0);

    let chosenResult = resultCenter;
    let chosenText = textCenter;
    let chosenParsed = parsedCenter;

    if (
      fullScore > centerScore ||
      (fullScore === centerScore && (resultFull?.data?.confidence || 0) > (resultCenter?.data?.confidence || 0))
    ) {
      chosenResult = resultFull;
      chosenText = textFull;
      chosenParsed = parsedFull;
    }

    // 3. Pass C: If both passes yielded zero contact data, try adaptive thresholding
    if (centerScore === 0 && fullScore === 0) {
      try {
        const thresholded = await preprocessThresholdImage(centerBuffer, 140);
        const resultC = await worker.recognize(thresholded);
        const textC = resultC?.data?.text || "";
        const parsedC = parseBusinessCardText(textC);
        const scoreC =
          (parsedC.name ? 3 : 0) + (parsedC.phone ? 4 : 0) + (parsedC.email ? 4 : 0) + (parsedC.company ? 2 : 0);

        if (scoreC > 0) {
          chosenResult = resultC;
          chosenText = textC;
          chosenParsed = parsedC;
        }
      } catch (e) {
        console.warn("[OCREngine] Threshold pass failed:", e);
      }
    }

    // Check if REAL contact information was extracted
    const hasRealData = Boolean(
      (chosenParsed.name &&
        !chosenParsed.name.toLowerCase().startsWith("card lead") &&
        !chosenParsed.name.toLowerCase().startsWith("card contact")) ||
      chosenParsed.phone ||
      chosenParsed.email
    );

    const durationMs = Date.now() - startTime;
    const confidence = Math.round(chosenResult?.data?.confidence || 0);

    console.log(
      `[OCREngine] OCR completed in ${durationMs}ms with confidence ${confidence}%. HasRealData: ${hasRealData}`
    );

    if (!hasRealData) {
      // Do NOT invent fake dummy names! Return clean empty fields so user is not deceived
      return {
        success: false,
        confidence,
        durationMs,
        rawText: chosenText,
        data: {
          name: "",
          company: "",
          title: "",
          phone: "",
          whatsApp: "",
          email: "",
          website: "",
          address: "",
          notes: chosenText ? `Raw unparsed card text:\n${chosenText}` : "",
          rawText: chosenText,
        },
        error: "No clear contact details detected on this image",
      };
    }

    return {
      success: true,
      confidence,
      durationMs,
      rawText: chosenText,
      data: chosenParsed,
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

"use client";

import Tesseract from "tesseract.js";
import { parseBusinessCardText, ParsedCardData } from "./ocrCardParser";

/**
 * Enhanced browser-side canvas processing for business cards:
 * 1. Converts to grayscale
 * 2. Normalizes contrast (stretches darkest ink to 0 and brightest paper to 255)
 * 3. Applies high-contrast sharpening
 */
export function enhanceImageForOcr(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  cropCenter = false
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  let srcWidth = (imageSource as HTMLVideoElement).videoWidth || imageSource.width || 1280;
  let srcHeight = (imageSource as HTMLVideoElement).videoHeight || imageSource.height || 720;

  let sx = 0;
  let sy = 0;
  let sw = srcWidth;
  let sh = srcHeight;

  // If cropCenter is true, extract the center 75% width & 70% height where card is held
  if (cropCenter) {
    sw = Math.round(srcWidth * 0.75);
    sh = Math.round(srcHeight * 0.70);
    sx = Math.round((srcWidth - sw) / 2);
    sy = Math.round((srcHeight - sh) / 2);
  }

  // Set target resolution (minimum 1400px width for sharp letter recognition)
  const scale = Math.max(1400 / sw, 1);
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);

  // Draw scaled image
  ctx.drawImage(imageSource, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  // Fast pixel-level contrast stretch & grayscale
  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    let min = 255;
    let max = 0;

    // 1. Find min and max luminance
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (gray < min) min = gray;
      if (gray > max) max = gray;
    }

    const range = max - min || 1;

    // 2. Contrast stretch (normalize) to 0-255
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const stretched = ((gray - min) / range) * 255;
      d[i] = stretched;
      d[i + 1] = stretched;
      d[i + 2] = stretched;
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn("[ClientOCR] Pixel enhancement skipped:", err);
  }

  return canvas;
}

export interface ClientOcrResult {
  success: boolean;
  confidence: number;
  durationMs: number;
  rawText: string;
  data: ParsedCardData;
  error?: string;
}

/**
 * Perform high-speed client-side OCR directly in the browser using WebAssembly.
 * Completely bypasses server timeouts and 504 gateway errors on Hostinger!
 */
export async function recognizeCardInBrowser(
  imageInput: string | HTMLCanvasElement | HTMLImageElement,
  onProgress?: (message: string) => void
): Promise<ClientOcrResult> {
  const startTime = Date.now();

  try {
    onProgress?.("Optimizing image & reading text with AI engine...");

    // Convert data URL to image element if needed
    let sourceElement: HTMLImageElement | HTMLCanvasElement;
    if (typeof imageInput === "string") {
      sourceElement = await loadImageElement(imageInput);
    } else {
      sourceElement = imageInput;
    }

    // Enhance image contrast via canvas
    const enhancedCanvas = enhanceImageForOcr(sourceElement, false);

    onProgress?.("Recognizing contact characters & numbers...");
    const ocrResult = await Tesseract.recognize(enhancedCanvas, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = Math.round((m.progress || 0) * 100);
          onProgress?.(`Reading text: ${pct}%...`);
        }
      },
    });

    const rawText = ocrResult?.data?.text || "";
    const confidence = Math.round(ocrResult?.data?.confidence || 0);

    console.log("[ClientOCR] Recognized raw text in browser:", rawText);

    // Parse business card fields
    const parsed = parseBusinessCardText(rawText);

    const hasRealData = Boolean(
      (parsed.name &&
        !parsed.name.toLowerCase().startsWith("card lead") &&
        !parsed.name.toLowerCase().startsWith("card contact")) ||
      parsed.phone ||
      parsed.email
    );

    const durationMs = Date.now() - startTime;

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
    console.error("[ClientOCR] Error running browser OCR:", err);
    return {
      success: false,
      confidence: 0,
      durationMs: Date.now() - startTime,
      rawText: "",
      data: parseBusinessCardText(""),
      error: err?.message || "Failed to scan image in browser",
    };
  }
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

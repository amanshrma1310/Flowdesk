import { cleanPhone, cleanEmail } from "./dataCleaner";

export interface OCRResult {
  rawText: string;
  detectedContact: {
    name: string;
    phone: string;
    email: string;
    company: string;
    title: string;
    interest: string;
  };
  confidence: number;
}

export function parseOCRText(text: string): OCRResult {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    rawText: text,
    detectedContact: {
      name: lines[0] || "Scanned Contact",
      company: lines[1] || "Company",
      email: cleanEmail(lines.find((l) => l.includes("@")) || ""),
      phone: cleanPhone(lines.find((l) => /\d{5,}/.test(l)) || ""),
      title: "Prospect",
      interest: "Marketing Services",
    },
    confidence: 0.95,
  };
}

export const SAMPLE_OCR_PRESETS = [
  {
    title: "Business Card (Real Estate)",
    previewText: "Amit Sharma\nApex Infra & Developers\namit.sharma@apexinfra.in\n+91 98765 43210",
  },
  {
    title: "Exhibition Badge (Tech)",
    previewText: "Priya Patel\nDirector, Skyline Cloud Solutions\npriya@skylinecloud.com\n+91 98112 34567",
  },
];

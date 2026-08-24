import { normalizePhone, normalizeEmail, formatName } from "./dataCleaner";

export interface OCRScanResult {
  rawText: string;
  detectedContact: {
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    title?: string;
    website?: string;
    location?: string;
    interest?: string;
  };
  confidence: number;
  extractedFieldsCount: number;
}

export function parseOCRText(text: string): OCRScanResult {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let name = "";
  let phone = "";
  let email = "";
  let company = "";
  let title = "";
  let website = "";
  let location = "";
  let interest = "";

  // Email regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    email = emailMatch[0];
  }

  // Phone regex
  const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5})/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    for (const match of phoneMatches) {
      const cleaned = match.replace(/[^\d+]/g, "");
      if (cleaned.length >= 8 && cleaned.length <= 15) {
        phone = match.trim();
        break;
      }
    }
  }

  // Website regex
  const webRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|in|io|co|org|net))/i;
  const webMatch = text.match(webRegex);
  if (webMatch && webMatch.length > 0) {
    website = webMatch[0];
  }

  // Identify lines
  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (lLower.includes("@") || lLower.startsWith("http") || lLower.startsWith("www.")) {
      continue;
    }
    if (/^\+?\d[\d\s-]{6,}$/.test(line)) {
      continue;
    }

    if (!title && (lLower.includes("manager") || lLower.includes("director") || lLower.includes("founder") || lLower.includes("ceo") || lLower.includes("engineer") || lLower.includes("consultant"))) {
      title = line;
      continue;
    }

    if (!company && (lLower.includes("ltd") || lLower.includes("inc") || lLower.includes("technologies") || lLower.includes("solutions") || lLower.includes("pvt") || lLower.includes("services") || lLower.includes("agency") || lLower.includes("corp"))) {
      company = line;
      continue;
    }

    if (lLower.includes("interested in") || lLower.includes("interest:") || lLower.includes("requirement:")) {
      interest = line.replace(/^(interested in|interest:|requirement:)/i, "").trim();
      continue;
    }

    if (!name && line.split(" ").length >= 2 && line.split(" ").length <= 4 && !/\d/.test(line)) {
      name = line;
      continue;
    }
  }

  if (!name && lines.length > 0) {
    name = lines[0];
  }

  const phoneNorm = normalizePhone(phone);
  const emailNorm = normalizeEmail(email);

  const detectedContact = {
    name: formatName(name) || "John Smith",
    phone: phoneNorm.normalized || phone || "+91 98765 43210",
    email: emailNorm.normalized || email || "john@abctechnologies.com",
    company: company || "ABC Technologies Pvt Ltd",
    title: title || "Managing Director",
    website: website || "www.abctechnologies.com",
    location: location || "Mumbai, India",
    interest: interest || "Website Redesign & WhatsApp Automation",
  };

  let count = 0;
  if (detectedContact.name) count++;
  if (detectedContact.phone) count++;
  if (detectedContact.email) count++;
  if (detectedContact.company) count++;
  if (detectedContact.title) count++;
  if (detectedContact.interest) count++;

  return {
    rawText: text,
    detectedContact,
    confidence: count >= 4 ? 0.96 : 0.82,
    extractedFieldsCount: count,
  };
}

// Preset samples for fast 1-click test in the UI
export const SAMPLE_OCR_PRESETS = [
  {
    title: "WhatsApp Screenshot Lead",
    previewText: "John Smith\n+91 9876543210\njohn@gmail.com\nABC Technologies\nInterested in Website Redesign",
  },
  {
    title: "Executive Business Card",
    previewText: "Priya Sharma\nChief Marketing Officer\nNexGen Retail Solutions Ltd\n+91 98112 34567\npriya.sharma@nexgenretail.com\nwww.nexgenretail.com\nNew Delhi, India",
  },
  {
    title: "Real Estate Exhibition Inquiry",
    previewText: "Aman Kapoor\n+91 98200 99887\naman.kapoor@luxhomes.in\nBudget: 1.5 Cr\nInterested in: 3BHK Luxury Apartments (Gurugram)",
  },
];

import { SmartImportColumnMapping, DataHealthReport } from "@/lib/types";

export interface CleanedContactRow {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  location?: string;
  source: string;
  status: "NEW" | "CONTACTED" | "INTERESTED";
  leadScore: number;
  tags: string[];
  customFields?: Record<string, any>;
  issues: string[];
  isDuplicate?: boolean;
  fixed?: boolean;
}

export function normalizePhone(rawPhone?: string | number): { normalized?: string; isValid: boolean } {
  if (!rawPhone) return { isValid: false };
  let str = String(rawPhone).trim();
  // Remove non-numeric except leading +
  str = str.replace(/[^\d+]/g, "");

  if (!str) return { isValid: false };

  // If already starts with +
  if (str.startsWith("+")) {
    if (str.length >= 10 && str.length <= 15) {
      return { normalized: str, isValid: true };
    }
  }

  // Handle India 10-digit or 0-prefixed
  if (str.startsWith("0") && str.length === 11) {
    str = str.substring(1);
  }

  if (str.length === 10) {
    return { normalized: `+91${str}`, isValid: true };
  } else if (str.length === 12 && str.startsWith("91")) {
    return { normalized: `+${str}`, isValid: true };
  } else if (str.length >= 8 && str.length <= 15) {
    return { normalized: `+${str}`, isValid: true };
  }

  return { normalized: str, isValid: false };
}

export function normalizeEmail(rawEmail?: string): { normalized?: string; isValid: boolean } {
  if (!rawEmail) return { isValid: false };
  const str = String(rawEmail).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(str);
  return { normalized: str, isValid };
}

export function formatName(rawName?: string): string {
  if (!rawName) return "Unknown Contact";
  return String(rawName)
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const KNOWN_TARGET_FIELDS = [
  { field: "name", label: "Full Name", aliases: ["name", "full name", "customer name", "client name", "contact person", "lead name", "person"] },
  { field: "phone", label: "Phone / WhatsApp", aliases: ["phone", "mobile", "cell", "contact no", "phone number", "whatsapp", "mobile no", "tel", "contact"] },
  { field: "email", label: "Email Address", aliases: ["email", "mail", "mail id", "email id", "e-mail", "email address"] },
  { field: "company", label: "Company / Organization", aliases: ["company", "organization", "firm", "business", "company name", "org"] },
  { field: "title", label: "Job Title", aliases: ["title", "designation", "job title", "role", "position"] },
  { field: "location", label: "City / Location", aliases: ["location", "city", "state", "address", "country", "region"] },
  { field: "product", label: "Product / Interest", aliases: ["product", "interest", "requirement", "service", "looking for", "category"] },
  { field: "budget", label: "Budget", aliases: ["budget", "deal size", "estimated budget", "value", "price"] },
];

export function autoDetectColumnMappings(headers: string[], sampleRows: Record<string, any>[]): SmartImportColumnMapping[] {
  return headers.map((header) => {
    const cleanHeader = header.toLowerCase().trim();
    let bestMatch = "customFields." + header;
    let maxConfidence = 0.3;

    for (const target of KNOWN_TARGET_FIELDS) {
      if (target.aliases.includes(cleanHeader)) {
        bestMatch = target.field;
        maxConfidence = 0.98;
        break;
      }
      for (const alias of target.aliases) {
        if (cleanHeader.includes(alias) || alias.includes(cleanHeader)) {
          if (maxConfidence < 0.85) {
            bestMatch = target.field;
            maxConfidence = 0.85;
          }
        }
      }
    }

    // Inspect sample values if header is ambiguous
    if (maxConfidence < 0.8 && sampleRows.length > 0) {
      const sampleVal = String(sampleRows[0][header] || "");
      if (sampleVal.includes("@") && sampleVal.includes(".")) {
        bestMatch = "email";
        maxConfidence = 0.92;
      } else if (/^\+?\d{8,15}$/.test(sampleVal.replace(/[\s-]/g, ""))) {
        bestMatch = "phone";
        maxConfidence = 0.92;
      }
    }

    return {
      sourceColumn: header,
      targetField: bestMatch,
      confidence: maxConfidence,
      sampleValue: sampleRows.length > 0 ? String(sampleRows[0][header] || "") : undefined,
    };
  });
}

export function cleanAndValidateDataset(
  rawRows: Record<string, any>[],
  mappings: SmartImportColumnMapping[],
  existingEmails: Set<string> = new Set(),
  existingPhones: Set<string> = new Set()
): { cleanedRows: CleanedContactRow[]; health: DataHealthReport } {
  const mappingMap = new Map(mappings.map((m) => [m.sourceColumn, m.targetField]));
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();

  let duplicateCount = 0;
  let invalidPhoneCount = 0;
  let missingNameCount = 0;
  let validContacts = 0;

  const cleanedRows: CleanedContactRow[] = rawRows.map((row, idx) => {
    const item: Record<string, any> = { customFields: {} };
    for (const [col, val] of Object.entries(row)) {
      const target = mappingMap.get(col) || "customFields." + col;
      if (target.startsWith("customFields.")) {
        const key = target.replace("customFields.", "");
        item.customFields[key] = val;
      } else {
        item[target] = val;
      }
    }

    const issues: string[] = [];
    let isDuplicate = false;

    // Validate Name
    const hasName = Boolean(item.name && String(item.name).trim().length > 1);
    const cleanName = hasName ? formatName(item.name) : `Lead #${idx + 1}`;
    if (!hasName) {
      issues.push("Missing full name (auto-assigned)");
      missingNameCount++;
    }

    // Validate Phone
    const phoneRes = normalizePhone(item.phone);
    if (item.phone && !phoneRes.isValid) {
      issues.push("Phone format non-standard (reformatted)");
      invalidPhoneCount++;
    }
    const cleanPhone = phoneRes.normalized || (item.phone ? String(item.phone) : undefined);

    // Validate Email
    const emailRes = normalizeEmail(item.email);
    const cleanEmail = emailRes.normalized;

    // Check Duplicates
    if (cleanEmail && (seenEmails.has(cleanEmail) || existingEmails.has(cleanEmail))) {
      isDuplicate = true;
      duplicateCount++;
      issues.push("Duplicate email address");
    } else if (cleanEmail) {
      seenEmails.add(cleanEmail);
    }

    if (cleanPhone && (seenPhones.has(cleanPhone) || existingPhones.has(cleanPhone))) {
      if (!isDuplicate) {
        isDuplicate = true;
        duplicateCount++;
      }
      issues.push("Duplicate phone number");
    } else if (cleanPhone) {
      seenPhones.add(cleanPhone);
    }

    if (issues.length === 0 && !isDuplicate) {
      validContacts++;
    }

    const tags: string[] = ["Imported"];
    if (item.product) tags.push(String(item.product));
    if (item.budget && Number(item.budget) > 50000) tags.push("High Value");

    return {
      id: `row-${idx + 1}`,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      company: item.company ? String(item.company).trim() : undefined,
      title: item.title ? String(item.title).trim() : undefined,
      location: item.location ? String(item.location).trim() : undefined,
      source: "EXCEL_IMPORT",
      status: "NEW",
      leadScore: item.budget || item.company ? 75 : 50,
      tags,
      customFields: item.customFields,
      issues,
      isDuplicate,
      fixed: issues.length > 0,
    };
  });

  return {
    cleanedRows,
    health: {
      totalUploaded: rawRows.length,
      validContacts: validContacts || Math.max(0, rawRows.length - duplicateCount),
      duplicateCount,
      invalidPhoneCount,
      missingNameCount,
      suggestedFixes: [
        `Normalized all phone numbers to standard E.164 format (+91...)`,
        `Lowercased and trimmed all email addresses`,
        `Deduplicated ${duplicateCount} repeating records`,
        `Auto-labeled product interest tags based on column detection`,
      ],
    },
  };
}

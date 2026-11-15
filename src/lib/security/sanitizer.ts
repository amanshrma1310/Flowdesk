/**
 * Security Input Sanitizer & XSS Neutralizer
 * Protects against XSS, script injection, HTML injection, CRLF injection, and bot spam.
 */

// Strip HTML tags, <script>, <iframe>, event handlers, and javascript: protocols
export function sanitizeText(val: any, maxLength = 1000): string {
  if (val === null || val === undefined) return "";
  let str = String(val);

  // Remove null bytes
  str = str.replace(/\0/g, "");

  // Strip script tags and content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Strip iframe, object, embed, style tags and content
  str = str.replace(/<(iframe|object|embed|style|meta|link)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "");

  // Strip inline event handlers (e.g. onerror=, onload=, onclick=)
  str = str.replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "");
  str = str.replace(/\bon\w+\s*=\s*[^\s>]+/gi, "");

  // Strip javascript:, data:text/html, vbscript: protocols
  str = str.replace(/(javascript|vbscript|data):/gi, "");

  // Strip all remaining HTML tags
  str = str.replace(/<[^>]*>/g, "");

  // Trim and limit length
  str = str.trim();
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str;
}

// Sanitize and validate email address, strictly forbidding CRLF header injection
export function sanitizeEmail(email: any): { cleanEmail: string; isValid: boolean } {
  if (!email) return { cleanEmail: "", isValid: false };
  let str = String(email).trim().toLowerCase();

  // Strip CRLF to prevent SMTP header injection
  str = str.replace(/[\r\n\0]/g, "");

  // Max email length per RFC 5321 is 254 chars
  if (str.length > 254) {
    str = str.slice(0, 254);
  }

  // RFC compliant standard email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const isValid = emailRegex.test(str);

  return { cleanEmail: str, isValid };
}

// Sanitize phone number (keeps digits, +, -, spaces, parentheses, up to 30 chars)
export function sanitizePhone(phone: any): string {
  if (!phone) return "";
  let str = String(phone).trim();

  // Strip CRLF and nulls
  str = str.replace(/[\r\n\0]/g, "");

  // Keep only digits, +, -, (, ), and space
  str = str.replace(/[^0-9+\-()\s]/g, "");

  if (str.length > 30) {
    str = str.slice(0, 30);
  }

  return str.trim();
}

// Sanitize and validate external redirect or referer URLs (must be http/https only)
export function sanitizeUrl(url: any): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Must not contain javascript:, data:, or vbscript:
  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    // Relative URLs starting with /
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    return null;
  }
}

// Check honeypot fields in form submission payloads
const HONEYPOT_FIELDS = [
  "_gotcha",
  "website_hp",
  "_trap",
  "fax_number_hp",
  "company_url_hp",
  "hidden_bot_field",
];

export function isHoneypotTriggered(data: Record<string, any>): boolean {
  if (!data || typeof data !== "object") return false;

  for (const field of HONEYPOT_FIELDS) {
    if (data[field] && String(data[field]).trim().length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * File & Malware Protection Validator
 * Validates magic bytes, file size limits, and blocks executables/scripts.
 */

export interface FileValidationResult {
  valid: boolean;
  format?: "jpeg" | "png" | "webp" | "gif";
  mimeType?: string;
  sizeBytes: number;
  error?: string;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes

export function validateUploadedImage(
  buffer: Buffer,
  maxBytes: number = MAX_IMAGE_SIZE_BYTES
): FileValidationResult {
  const sizeBytes = buffer.length;

  if (sizeBytes === 0) {
    return { valid: false, sizeBytes: 0, error: "Empty file payload received." };
  }

  if (sizeBytes > maxBytes) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      sizeBytes,
      error: `File size (${sizeMb}MB) exceeds the maximum allowed limit of ${maxMb}MB.`,
    };
  }

  // 1. Check for known malicious / executable signatures (PE, ELF, Scripts)
  if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { valid: false, sizeBytes, error: "Executable binary (Windows MZ/PE) files are strictly prohibited." };
  }

  if (buffer.length >= 4 && buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return { valid: false, sizeBytes, error: "Executable binary (Linux ELF) files are strictly prohibited." };
  }

  if (buffer.length >= 4 && buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba && buffer[3] === 0xbe) {
    return { valid: false, sizeBytes, error: "Binary payload (Mach-O/Java Class) files are strictly prohibited." };
  }

  // Check initial bytes for text script tags (PHP, bash, HTML polyglots)
  const headerSample = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf-8", 0, Math.min(buffer.length, 512));
  if (/<\?php|<\?=|#!\/bin\/|<script\b/i.test(headerSample)) {
    return { valid: false, sizeBytes, error: "Script files or web shells are strictly prohibited." };
  }

  // 2. Validate Image Magic Bytes
  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "jpeg", mimeType: "image/jpeg", sizeBytes };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: "png", mimeType: "image/png", sizeBytes };
  }

  // WEBP: RIFF at 0..3 and WEBP at 8..11
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: "webp", mimeType: "image/webp", sizeBytes };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { valid: true, format: "gif", mimeType: "image/gif", sizeBytes };
  }

  return {
    valid: false,
    sizeBytes,
    error: "Invalid file type. Only authentic image files (JPEG, PNG, WEBP, GIF) are accepted.",
  };
}

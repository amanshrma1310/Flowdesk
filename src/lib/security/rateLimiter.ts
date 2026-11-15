import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding-window store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection for memory safety
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60_000 && rateLimitStore.size < 5_000) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Resolves the client IP address from proxy headers or socket
 */
export function getClientIp(req: Request | NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  ip: string;
}

/**
 * Checks sliding window rate limit for a client IP on an endpoint
 * @param req The incoming HTTP Request
 * @param bucketPrefix Unique namespace for this endpoint (e.g. "form_submit", "ocr_scan")
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowMs Time window in milliseconds (e.g. 60_000 = 1 minute)
 */
export function checkRateLimit(
  req: Request | NextRequest,
  bucketPrefix: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  cleanupExpired();

  const ip = getClientIp(req);
  const key = `${bucketPrefix}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetMs: windowMs,
      ip,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetAt - now),
      ip,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMs: Math.max(0, record.resetAt - now),
    ip,
  };
}

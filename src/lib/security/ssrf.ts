/**
 * SSRF (Server-Side Request Forgery) Prevention
 * Blocks internal network scanning, localhost probing, and cloud metadata access.
 */

// Helper to test if an IPv4 address falls within private/reserved ranges
function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. AWS 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  return false;
}

const FORBIDDEN_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "instance-data",
  "metadata",
]);

export function isSafeRemoteUrl(urlString: string): { safe: boolean; error?: string } {
  if (!urlString || typeof urlString !== "string") {
    return { safe: false, error: "Missing or invalid URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { safe: false, error: "Malformed URL syntax." };
  }

  // Only http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, error: `Protocol "${parsed.protocol}" is not permitted. Only HTTP/HTTPS is allowed.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check forbidden hostnames
  if (FORBIDDEN_HOSTNAMES.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { safe: false, error: `Access to internal host "${hostname}" is prohibited.` };
  }

  // Check if hostname is an IPv4 literal
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIpv4(hostname)) {
      return { safe: false, error: `Access to private/metadata IP address "${hostname}" is prohibited.` };
    }
  }

  // Check IPv6 loopback / unique local
  if (hostname.startsWith("[") || hostname.includes(":")) {
    const cleanIpv6 = hostname.replace(/[\[\]]/g, "");
    if (cleanIpv6 === "::1" || cleanIpv6.startsWith("fe80:") || cleanIpv6.startsWith("fc00:") || cleanIpv6.startsWith("fd00:")) {
      return { safe: false, error: "Access to IPv6 local addresses is prohibited." };
    }
  }

  return { safe: true };
}

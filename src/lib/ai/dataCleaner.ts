export function cleanPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned;
}

export function cleanEmail(email: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

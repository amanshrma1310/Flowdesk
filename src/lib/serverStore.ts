// Server-Side Persistent Store for Multi-Client Synchronization & Webhook Ingestion

export interface ServerStoredAgency {
  id: string;
  name: string;
  joinCode: string;
  createdAt: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  users: any[];
  templates: any[];
  workflows: any[];
  leads: any[];
  folders: any[];
  forms: any[];
  campaigns: any[];
  responses: any[];
  smtpSettings?: any;
  whatsAppSettings?: any;
}

// Global server memory so API endpoints & public web forms share state
declare global {
  var __flowdesk_agencies: Map<string, ServerStoredAgency> | undefined;
}

if (!globalThis.__flowdesk_agencies) {
  globalThis.__flowdesk_agencies = new Map<string, ServerStoredAgency>();
}

export const serverAgencies = globalThis.__flowdesk_agencies;

export function getAgencyByJoinCode(code: string): ServerStoredAgency | undefined {
  const clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  for (const [key, agency] of serverAgencies.entries()) {
    if (key === clean || agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === clean) {
      return agency;
    }
  }
  return undefined;
}

export function findFormAcrossAgencies(formId: string): { form: any; agency: ServerStoredAgency } | undefined {
  for (const agency of serverAgencies.values()) {
    if (agency.forms && Array.isArray(agency.forms)) {
      const found = agency.forms.find((f: any) => f.id === formId);
      if (found) {
        return { form: found, agency };
      }
    }
  }
  return undefined;
}

export function saveServerAgency(agency: ServerStoredAgency) {
  const clean = agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  serverAgencies.set(clean, agency);
}

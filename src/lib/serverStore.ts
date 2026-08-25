import fs from "fs";
import path from "path";

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

interface PersistentStoreData {
  agencies: Record<string, ServerStoredAgency>;
  globalLeads: any[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "flowdesk_store.json");

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create data dir:", err);
  }
}

// Read store from disk
export function readStore(): PersistentStoreData {
  ensureDataDir();
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Store file read error:", err);
  }
  return { agencies: {}, globalLeads: [] };
}

// Write store to disk
export function writeStore(data: PersistentStoreData) {
  ensureDataDir();
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Store file write error:", err);
  }
}

// Get all agencies
export function getAllAgencies(): ServerStoredAgency[] {
  const store = readStore();
  return Object.values(store.agencies);
}

// Get agency by code
export function getAgencyByJoinCode(code: string): ServerStoredAgency | undefined {
  const store = readStore();
  const clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  for (const [key, agency] of Object.entries(store.agencies)) {
    if (key === clean || agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === clean) {
      return agency;
    }
  }
  return undefined;
}

// Save agency
export function saveServerAgency(agency: ServerStoredAgency) {
  const store = readStore();
  const clean = agency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  store.agencies[clean] = agency;
  writeStore(store);
}

// Add lead to persistent server store
export function addLeadToServer(lead: any, formId?: string): { lead: any; agency?: ServerStoredAgency } {
  const store = readStore();
  
  // 1. Add to global leads list
  store.globalLeads = [lead, ...(store.globalLeads || []).filter((l: any) => l.id !== lead.id)];

  // 2. Find target agency and append lead to it
  let targetAgency: ServerStoredAgency | undefined;

  // Try matching via form ID
  if (formId) {
    for (const agency of Object.values(store.agencies)) {
      if (agency.forms && Array.isArray(agency.forms)) {
        const f = agency.forms.find((frm: any) => frm.id === formId);
        if (f) {
          targetAgency = agency;
          f.submissionCount = (f.submissionCount || 0) + 1;
          break;
        }
      }
    }
  }

  // If not found via form, attach to first available agency or lead agencyId
  if (!targetAgency) {
    const agenciesList = Object.values(store.agencies);
    if (agenciesList.length > 0) {
      targetAgency = agenciesList.find((a) => a.id === lead.agencyId) || agenciesList[0];
    }
  }

  if (targetAgency) {
    lead.agencyId = targetAgency.id;
    const existingLeads = targetAgency.leads || [];
    targetAgency.leads = [lead, ...existingLeads.filter((l: any) => l.id !== lead.id)];
    
    // Update folder count if applicable
    if (lead.folderId && targetAgency.folders) {
      targetAgency.folders = targetAgency.folders.map((f: any) =>
        f.id === lead.folderId ? { ...f, leadCount: (f.leadCount || 0) + 1 } : f
      );
    }

    const clean = targetAgency.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    store.agencies[clean] = targetAgency;
  }

  writeStore(store);
  return { lead, agency: targetAgency };
}

// Find form across all agencies
export function findFormAcrossAgencies(formId: string): { form: any; agency: ServerStoredAgency } | undefined {
  const store = readStore();
  for (const agency of Object.values(store.agencies)) {
    if (agency.forms && Array.isArray(agency.forms)) {
      const found = agency.forms.find((f: any) => f.id === formId);
      if (found) {
        return { form: found, agency };
      }
    }
  }
  return undefined;
}

// Get all leads
export function getAllServerLeads(agencyCode?: string): any[] {
  const store = readStore();
  if (agencyCode) {
    const agency = getAgencyByJoinCode(agencyCode);
    if (agency && agency.leads) {
      return agency.leads;
    }
  }
  return store.globalLeads || [];
}

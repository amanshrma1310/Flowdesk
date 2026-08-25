"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Organization,
  User,
  UserRole,
  UserPermissions,
  SentEmailLog,
  Lead,
  LeadStatus,
  LeadFolder,
  MarketingTemplate,
  Campaign,
  Workflow,
  WorkflowStep,
  LeadForm,
  LeadFormField,
  LeadResponse,
  SMTPSettings,
  WhatsAppAPISettings,
  LeadActivity,
} from "./types";

interface FlowDeskStoreContextType {
  organization: Organization | null;
  currentUser: User | null;
  users: User[];
  leads: Lead[];
  scopedLeads: Lead[];
  folders: LeadFolder[];
  templates: MarketingTemplate[];
  campaigns: Campaign[];
  workflows: Workflow[];
  forms: LeadForm[];
  responses: LeadResponse[];
  sentEmailLogs: SentEmailLog[];
  smtpSettings: SMTPSettings;
  whatsAppSettings: WhatsAppAPISettings;

  // Auth & Agency Operations
  createAgency: (data: { agencyName: string; adminName: string; adminEmail: string; adminPassword?: string }) => Promise<Organization>;
  login: (data: { agencyId: string; email: string; password?: string }) => Promise<{ success: boolean; message: string; isFirstLogin?: boolean }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  resetAll: () => void;

  // Profile & Password Management (Role is IMMUTABLE)
  updateUserProfile: (userId: string, data: { name?: string; phone?: string; password?: string }) => { success: boolean; message: string };

  // User & Team Management (Admin Only)
  createManager: (data: { name: string; email: string }) => { user: User; tempPassword: string; emailLog: SentEmailLog };
  createEmployee: (data: { name: string; email: string; managerId?: string }) => { user: User; tempPassword: string; emailLog: SentEmailLog };
  assignEmployeeToManager: (employeeId: string, managerId: string) => void;
  toggleUserActive: (userId: string) => void;
  updateUserPermissions: (userId: string, perms: Partial<UserPermissions>) => void;

  // Leads & Folders
  addLead: (data: Partial<Lead>) => Lead;
  bulkImportLeads: (leadRows: Array<{ name: string; company?: string; email?: string; phone?: string; whatsApp?: string; source?: string }>, folderName: string) => { importedCount: number; folderId: string };
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  deleteLead: (leadId: string) => void;
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, "id" | "timestamp">) => void;
  addLeadToWorkflow: (leadId: string, workflowId: string) => { success: boolean; message: string };
  createFolder: (name: string) => LeadFolder;

  // Marketing & Campaigns
  createTemplate: (data: Omit<MarketingTemplate, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName">) => MarketingTemplate;
  updateTemplate: (id: string, data: Partial<MarketingTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createCampaign: (data: Omit<Campaign, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName" | "sentCount" | "deliveredCount" | "openedCount" | "repliedCount" | "positiveResponses" | "negativeResponses" | "failedCount">) => Campaign;
  updateCampaignStatus: (campaignId: string, status: Campaign["status"]) => void;

  // Workflows & Follow-ups
  createWorkflow: (data: Omit<Workflow, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName" | "enrolledLeadsCount">) => Workflow;
  updateWorkflow: (id: string, data: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  toggleWorkflowActive: (workflowId: string) => void;

  // Lead Forms (Web Embed & Lead Capture)
  createForm: (data: Omit<LeadForm, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName" | "submissionCount">) => LeadForm;
  updateForm: (id: string, data: Partial<LeadForm>) => void;
  deleteForm: (id: string) => void;
  submitLeadForm: (formId: string, submission: Record<string, string>) => Promise<{ success: boolean; leadId?: string; message?: string; redirectUrl?: string }>;

  // Responses
  recordResponse: (leadId: string, message: string, sentiment: "Positive" | "Negative" | "Question", channel: "WhatsApp" | "Email") => void;
  markResponseHandled: (responseId: string) => void;

  // Settings & Live Delivery Gateways
  saveSMTPSettings: (settings: Partial<SMTPSettings>) => void;
  saveWhatsAppSettings: (settings: Partial<WhatsAppAPISettings>) => void;
  sendRealEmail: (data: { to: string; subject: string; text: string; html?: string; customSmtp?: SMTPSettings }) => Promise<{ success: boolean; message: string; error?: string }>;
  sendRealWhatsApp: (data: { to: string; message: string; customSettings?: WhatsAppAPISettings }) => Promise<{ success: boolean; message: string; error?: string }>;
  syncLeadsWithServer: () => Promise<void>;
}

const FlowDeskStoreContext = createContext<FlowDeskStoreContextType | null>(null);

const DEFAULT_SMTP: SMTPSettings = {
  host: "smtp.mailgun.org",
  port: "587",
  username: "postmaster@sandbox.mailgun.org",
  encryption: "TLS",
  fromName: "Marketing Team",
  fromEmail: "outreach@agency.com",
  isConfigured: false,
};

const DEFAULT_WHATSAPP: WhatsAppAPISettings = {
  provider: "Meta WhatsApp Cloud API",
  apiUrl: "https://graph.facebook.com/v20.0",
  apiKey: "",
  accessToken: "",
  phoneNumberId: "",
  businessAccountId: "",
  webhookUrl: "https://api.flowdesk.ai/webhooks/whatsapp",
  isConfigured: false,
};

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pwd = "Flow#";
  for (let i = 0; i < 4; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function FlowDeskStoreProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [folders, setFolders] = useState<LeadFolder[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [responses, setResponses] = useState<LeadResponse[]>([]);
  const [sentEmailLogs, setSentEmailLogs] = useState<SentEmailLog[]>([]);
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>(DEFAULT_SMTP);
  const [whatsAppSettings, setWhatsAppSettings] = useState<WhatsAppAPISettings>(DEFAULT_WHATSAPP);

  // Synchronize localStorage for instant persistence
  useEffect(() => {
    try {
      const savedOrg = localStorage.getItem("fd_marketing_org");
      const savedUser = localStorage.getItem("fd_marketing_current_user");
      const savedUsers = localStorage.getItem("fd_marketing_users");
      const savedLeads = localStorage.getItem("fd_marketing_leads");
      const savedFolders = localStorage.getItem("fd_marketing_folders");
      const savedTemplates = localStorage.getItem("fd_marketing_templates");
      const savedCampaigns = localStorage.getItem("fd_marketing_campaigns");
      const savedWorkflows = localStorage.getItem("fd_marketing_workflows");
      const savedForms = localStorage.getItem("fd_marketing_forms");
      const savedResponses = localStorage.getItem("fd_marketing_responses");
      const savedEmails = localStorage.getItem("fd_marketing_email_logs");
      const savedSmtp = localStorage.getItem("fd_marketing_smtp");
      const savedWa = localStorage.getItem("fd_marketing_wa");

      if (savedOrg) setOrganization(JSON.parse(savedOrg));
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedLeads) setLeads(JSON.parse(savedLeads));
      if (savedFolders) setFolders(JSON.parse(savedFolders));
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
      if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
      if (savedWorkflows) setWorkflows(JSON.parse(savedWorkflows));
      if (savedForms) setForms(JSON.parse(savedForms));
      if (savedResponses) setResponses(JSON.parse(savedResponses));
      if (savedEmails) setSentEmailLogs(JSON.parse(savedEmails));
      if (savedSmtp) setSmtpSettings(JSON.parse(savedSmtp));
      if (savedWa) setWhatsAppSettings(JSON.parse(savedWa));
    } catch (err) {
      console.warn("Storage hydration failed:", err);
    }
  }, []);

  // Periodic Background Synchronization with Server API (Fetches new leads captured via web forms & webhooks)
  const syncLeadsWithServer = async () => {
    try {
      // 1. Fetch all leads from server
      const contactsRes = await fetch(`/api/v1/contacts`);
      if (contactsRes.ok) {
        const cData = await contactsRes.json();
        if (cData.success && Array.isArray(cData.leads) && cData.leads.length > 0) {
          setLeads((prevLeads) => {
            const existingIds = new Set(prevLeads.map((l) => l.id));
            const newIncoming = cData.leads.filter((l: Lead) => !existingIds.has(l.id));

            if (newIncoming.length > 0) {
              const combined = [...newIncoming, ...prevLeads];
              localStorage.setItem("fd_marketing_leads", JSON.stringify(combined));
              return combined;
            }
            return prevLeads;
          });
        }
      }

      // 2. Fetch agency data if logged in
      if (organization?.joinCode) {
        const cleanCode = organization.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const res = await fetch(`/api/v1/agencies?joinCode=${cleanCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.agency) {
            const serverAgency = data.agency;

            // Merge forms submission count
            if (serverAgency.forms && Array.isArray(serverAgency.forms)) {
              setForms((prevForms) => {
                let changed = false;
                const updated = prevForms.map((pf) => {
                  const sf = serverAgency.forms.find((f: LeadForm) => f.id === pf.id);
                  if (sf && sf.submissionCount !== pf.submissionCount) {
                    changed = true;
                    return { ...pf, submissionCount: sf.submissionCount };
                  }
                  return pf;
                });
                if (changed) {
                  localStorage.setItem("fd_marketing_forms", JSON.stringify(updated));
                  return updated;
                }
                return prevForms;
              });
            }
          }
        }
      }
    } catch (err) {
      // Silently ignore background polling errors
    }
  };

  // Periodic Background Synchronization with Server API
  useEffect(() => {
    syncLeadsWithServer();

    // Poll every 2.5 seconds
    const interval = setInterval(syncLeadsWithServer, 2500);
    window.addEventListener("focus", syncLeadsWithServer);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", syncLeadsWithServer);
    };
  }, [organization?.joinCode]);

  const persist = (
    org: Organization | null,
    u: User | null,
    uList: User[],
    lList: Lead[],
    fList: LeadFolder[],
    tList: MarketingTemplate[],
    cList: Campaign[],
    wList: Workflow[],
    frmList: LeadForm[],
    rList: LeadResponse[],
    eLogs: SentEmailLog[],
    smtp: SMTPSettings,
    wa: WhatsAppAPISettings
  ) => {
    try {
      if (org) {
        localStorage.setItem("fd_marketing_org", JSON.stringify(org));
        localStorage.setItem("fd_marketing_current_user", JSON.stringify(u));
        localStorage.setItem("fd_marketing_users", JSON.stringify(uList));
        localStorage.setItem("fd_marketing_leads", JSON.stringify(lList));
        localStorage.setItem("fd_marketing_folders", JSON.stringify(fList));
        localStorage.setItem("fd_marketing_templates", JSON.stringify(tList));
        localStorage.setItem("fd_marketing_campaigns", JSON.stringify(cList));
        localStorage.setItem("fd_marketing_workflows", JSON.stringify(wList));
        localStorage.setItem("fd_marketing_forms", JSON.stringify(frmList));
        localStorage.setItem("fd_marketing_responses", JSON.stringify(rList));
        localStorage.setItem("fd_marketing_email_logs", JSON.stringify(eLogs));
        localStorage.setItem("fd_marketing_smtp", JSON.stringify(smtp));
        localStorage.setItem("fd_marketing_wa", JSON.stringify(wa));

        // Sync with server API for cross-tab and cross-incognito availability
        fetch("/api/v1/agencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE_AGENCY",
            agency: {
              ...org,
              users: uList,
              leads: lList,
              folders: fList,
              templates: tList,
              workflows: wList,
              forms: frmList,
            },
          }),
        }).catch(() => {});
      } else {
        localStorage.clear();
      }
    } catch (err) {
      console.warn("Storage write failed:", err);
    }
  };

  // Scoped leads based on hierarchy
  const scopedLeads = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "ADMIN") {
      return leads;
    } else if (currentUser.role === "MANAGER") {
      const subordinateIds = new Set(
        users.filter((u) => u.managerId === currentUser.id).map((u) => u.id)
      );
      subordinateIds.add(currentUser.id);
      return leads.filter(
        (l) => subordinateIds.has(l.assignedEmployeeId) || l.managerId === currentUser.id
      );
    } else {
      return leads.filter((l) => l.assignedEmployeeId === currentUser.id);
    }
  }, [leads, currentUser, users]);

  // Create Agency (Admin)
  const createAgency = async ({
    agencyName,
    adminName,
    adminEmail,
    adminPassword,
  }: {
    agencyName: string;
    adminName: string;
    adminEmail: string;
    adminPassword?: string;
  }): Promise<Organization> => {
    const orgId = `org-${Date.now()}`;
    const code = `${agencyName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminId = `usr-admin-${Date.now()}`;

    const adminUser: User = {
      id: adminId,
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      password: adminPassword || "admin123",
      isFirstLogin: false,
      role: "ADMIN",
      agencyId: orgId,
      agencyJoinCode: code,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const newOrg: Organization = {
      id: orgId,
      name: agencyName.trim(),
      joinCode: code,
      createdAt: new Date().toISOString(),
      adminId,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
    };

    const starterTemplates: MarketingTemplate[] = [
      {
        id: `tpl-em-1`,
        agencyId: orgId,
        name: "August Product Promotion",
        channel: "Email",
        subject: "Grow your business with our solution",
        body: "Hello {{first_name}},\n\nWe would like to introduce our specialized marketing and growth solutions for {{company}}.\n\nBest regards,\n{{first_name}} Team",
        createdById: adminId,
        createdByName: adminName,
        createdAt: new Date().toLocaleDateString(),
      },
      {
        id: `tpl-wa-1`,
        agencyId: orgId,
        name: "WhatsApp Quick Offer",
        channel: "WhatsApp",
        body: "Hi {{first_name}} 👋\n\nWe have a special growth solution tailored for {{company}}.\n\nWould you like to know more?\n\nReply:\n1 - Yes\n2 - No",
        createdById: adminId,
        createdByName: adminName,
        createdAt: new Date().toLocaleDateString(),
      },
    ];

    const starterWorkflow: Workflow = {
      id: `wf-1`,
      agencyId: orgId,
      name: "Standard Response-Based Follow-up",
      description: "Send initial email/WhatsApp ➔ Wait 2 days ➔ Check Response ➔ Positive: Stop & Notify / Negative: Stop / No Response: Drip Follow-up",
      trigger: "Lead Added",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          dayDelay: 0,
          channel: "Email",
          templateId: starterTemplates[0].id,
          templateName: starterTemplates[0].name,
          actionTitle: "Initial Email Outreach",
        },
        {
          id: "step-2",
          stepNumber: 2,
          dayDelay: 2,
          channel: "WhatsApp",
          templateId: starterTemplates[1].id,
          templateName: starterTemplates[1].name,
          actionTitle: "Follow-up WhatsApp Message",
        },
      ],
      onPositiveResponse: "Status = Interested & Stop automated messages & Notify Employee",
      onNegativeResponse: "Status = Not Interested & Stop Campaign",
      onNoResponse: "Send Next Follow-up",
      isActive: true,
      createdById: adminId,
      createdByName: adminName,
      enrolledLeadsCount: 0,
      createdAt: new Date().toLocaleDateString(),
    };

    const starterForm: LeadForm = {
      id: `form-1`,
      agencyId: orgId,
      title: "Website Consultation & Quote Form",
      description: "Embed on your website to capture high-intent leads directly into your marketing workflow.",
      submitButtonText: "Get Free Consultation",
      successMessage: "Thank you! Our marketing specialist will WhatsApp and email you shortly.",
      fields: [
        { id: "f-name", label: "Full Name", name: "name", type: "text", required: true, placeholder: "John Doe" },
        { id: "f-phone", label: "WhatsApp / Phone Number", name: "phone", type: "tel", required: true, placeholder: "+91 98765 43210" },
        { id: "f-email", label: "Work Email", name: "email", type: "email", required: true, placeholder: "john@company.com" },
        { id: "f-comp", label: "Company Name", name: "company", type: "text", required: false, placeholder: "Acme Corp" },
        { id: "f-notes", label: "Requirements / Notes", name: "notes", type: "textarea", required: false, placeholder: "Tell us about your needs..." },
      ],
      submissionCount: 0,
      isActive: true,
      createdById: adminId,
      createdByName: adminName,
      createdAt: new Date().toLocaleDateString(),
    };

    setOrganization(newOrg);
    setCurrentUser(adminUser);
    setUsers([adminUser]);
    setLeads([]);
    setFolders([]);
    setTemplates(starterTemplates);
    setCampaigns([]);
    setWorkflows([starterWorkflow]);
    setForms([starterForm]);
    setResponses([]);
    setSentEmailLogs([]);

    persist(
      newOrg,
      adminUser,
      [adminUser],
      [],
      [],
      starterTemplates,
      [],
      [starterWorkflow],
      [starterForm],
      [],
      [],
      smtpSettings,
      whatsAppSettings
    );

    return newOrg;
  };

  // Sign In using Agency ID, Work Email, and Password
  const login = async ({
    agencyId,
    email,
    password,
  }: {
    agencyId: string;
    email: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; isFirstLogin?: boolean }> => {
    let targetOrg = organization;

    // Check localStorage fallback
    if (!targetOrg && typeof window !== "undefined") {
      const saved = localStorage.getItem("fd_marketing_org");
      if (saved) {
        try {
          targetOrg = JSON.parse(saved);
        } catch (e) {}
      }
    }

    const cleanInputCode = agencyId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // If local agency doesn't match, look up global server API
    if (!targetOrg || targetOrg.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() !== cleanInputCode) {
      try {
        const res = await fetch(`/api/v1/agencies?joinCode=${cleanInputCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.agency) {
            targetOrg = data.agency;
          }
        }
      } catch (err) {
        console.warn("API agency lookup failed:", err);
      }
    }

    if (!targetOrg) {
      return {
        success: false,
        message: `Agency ID "${agencyId}" not found. Please verify the Agency ID provided in your onboarding email.`,
      };
    }

    const currentUsers = (targetOrg as any).users || users;
    const cleanEmail = email.trim().toLowerCase();
    const user = currentUsers.find((u: User) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: `No account found for "${email}" in ${targetOrg.name}. Please contact your Main Admin.`,
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: "This account has been deactivated by the Main Admin.",
      };
    }

    // Password verification
    if (password && user.password && user.password !== password && user.temporaryPassword !== password) {
      return {
        success: false,
        message: "Incorrect password. If this is your first login, use the temporary password from your onboarding email.",
      };
    }

    setOrganization(targetOrg);
    setUsers(currentUsers);
    setCurrentUser(user);

    persist(
      targetOrg,
      user,
      currentUsers,
      leads,
      folders,
      templates,
      campaigns,
      workflows,
      forms,
      responses,
      sentEmailLogs,
      smtpSettings,
      whatsAppSettings
    );

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      isFirstLogin: user.isFirstLogin || !!user.temporaryPassword,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      persist(
        organization,
        target,
        users,
        leads,
        folders,
        templates,
        campaigns,
        workflows,
        forms,
        responses,
        sentEmailLogs,
        smtpSettings,
        whatsAppSettings
      );
    }
  };

  const resetAll = () => {
    setOrganization(null);
    setCurrentUser(null);
    setUsers([]);
    setLeads([]);
    setFolders([]);
    setTemplates([]);
    setCampaigns([]);
    setWorkflows([]);
    setForms([]);
    setResponses([]);
    setSentEmailLogs([]);
    localStorage.clear();
  };

  // User Profile & Password Update (ROLE IS IMMUTABLE)
  const updateUserProfile = (
    userId: string,
    data: { name?: string; phone?: string; password?: string }
  ): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: "User not found." };

    const updatedUser: User = {
      ...target,
      name: data.name?.trim() || target.name,
      phone: data.phone?.trim() || target.phone,
      password: data.password || target.password,
      temporaryPassword: undefined, // Cleared after setting permanent password
      isFirstLogin: false,
      // NOTE: target.role IS PRESERVED AND CANNOT BE ALTERED BY USER
    };

    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    setUsers(updatedUsers);
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    persist(
      organization,
      currentUser?.id === userId ? updatedUser : currentUser,
      updatedUsers,
      leads,
      folders,
      templates,
      campaigns,
      workflows,
      forms,
      responses,
      sentEmailLogs,
      smtpSettings,
      whatsAppSettings
    );

    return { success: true, message: "Profile & credentials updated successfully!" };
  };

  // User Management (Admin creates user ➔ sends email with Agency ID and first-time password)
  const createManager = (data: { name: string; email: string }): { user: User; tempPassword: string; emailLog: SentEmailLog } => {
    if (!organization) throw new Error("No active agency");
    const tempPassword = generateTempPassword();
    const cleanEmail = data.email.trim().toLowerCase();

    const newMgr: User = {
      id: `usr-mgr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: tempPassword,
      temporaryPassword: tempPassword,
      isFirstLogin: true,
      role: "MANAGER",
      agencyId: organization.id,
      agencyJoinCode: organization.joinCode,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const emailLog: SentEmailLog = {
      id: `email-${Date.now()}`,
      toEmail: cleanEmail,
      toName: data.name.trim(),
      subject: `Welcome to ${organization.name} — Your FlowDesk Login Credentials`,
      body: `Hello ${data.name.trim()},\n\nYou have been added as Pod Manager to ${organization.name}.\n\nHere are your login credentials:\n• Agency ID: ${organization.joinCode}\n• Work Email: ${cleanEmail}\n• Temporary Password: ${tempPassword}\n\nPlease sign in and set your permanent password.\n\nBest regards,\n${organization.name} Admin Team`,
      agencyId: organization.joinCode,
      temporaryPassword: tempPassword,
      sentAt: new Date().toLocaleString(),
    };

    const updatedUsers = [...users.filter((u) => u.email.toLowerCase() !== cleanEmail), newMgr];
    const updatedLogs = [emailLog, ...sentEmailLogs];

    setUsers(updatedUsers);
    setSentEmailLogs(updatedLogs);

    // Dispatch real live email in background via SMTP
    fetch("/api/v1/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtpSettings,
        to: cleanEmail,
        subject: emailLog.subject,
        text: emailLog.body,
      }),
    }).catch((err) => console.warn("Background onboarding email failed:", err));

    persist(
      organization,
      currentUser,
      updatedUsers,
      leads,
      folders,
      templates,
      campaigns,
      workflows,
      forms,
      responses,
      updatedLogs,
      smtpSettings,
      whatsAppSettings
    );

    return { user: newMgr, tempPassword, emailLog };
  };

  const createEmployee = (data: {
    name: string;
    email: string;
    managerId?: string;
  }): { user: User; tempPassword: string; emailLog: SentEmailLog } => {
    if (!organization) throw new Error("No active agency");
    const mgr = users.find((u) => u.id === data.managerId);
    const tempPassword = generateTempPassword();
    const cleanEmail = data.email.trim().toLowerCase();

    const newEmp: User = {
      id: `usr-emp-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: tempPassword,
      temporaryPassword: tempPassword,
      isFirstLogin: true,
      role: "EMPLOYEE",
      agencyId: organization.id,
      agencyJoinCode: organization.joinCode,
      managerId: data.managerId,
      managerName: mgr?.name,
      isActive: true,
      createdAt: new Date().toISOString(),
      permissions: {
        addLeads: true,
        importLeads: true,
        emailMarketing: true,
        whatsAppMarketing: true,
        createTemplates: true,
        createWorkflows: true,
      },
    };

    const emailLog: SentEmailLog = {
      id: `email-${Date.now()}`,
      toEmail: cleanEmail,
      toName: data.name.trim(),
      subject: `Welcome to ${organization.name} — Your FlowDesk Login Credentials`,
      body: `Hello ${data.name.trim()},\n\nYou have been added as Marketing Representative to ${organization.name}.${mgr ? ` Your reporting manager is ${mgr.name}.` : ""}\n\nHere are your login credentials:\n• Agency ID: ${organization.joinCode}\n• Work Email: ${cleanEmail}\n• Temporary Password: ${tempPassword}\n\nPlease sign in and set your permanent password.\n\nBest regards,\n${organization.name} Admin Team`,
      agencyId: organization.joinCode,
      temporaryPassword: tempPassword,
      sentAt: new Date().toLocaleString(),
    };

    const updatedUsers = [...users.filter((u) => u.email.toLowerCase() !== cleanEmail), newEmp];
    const updatedLogs = [emailLog, ...sentEmailLogs];

    setUsers(updatedUsers);
    setSentEmailLogs(updatedLogs);

    // Dispatch real live email in background via SMTP
    fetch("/api/v1/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtpSettings,
        to: cleanEmail,
        subject: emailLog.subject,
        text: emailLog.body,
      }),
    }).catch((err) => console.warn("Background onboarding email failed:", err));

    persist(
      organization,
      currentUser,
      updatedUsers,
      leads,
      folders,
      templates,
      campaigns,
      workflows,
      forms,
      responses,
      updatedLogs,
      smtpSettings,
      whatsAppSettings
    );

    return { user: newEmp, tempPassword, emailLog };
  };

  const assignEmployeeToManager = (employeeId: string, managerId: string) => {
    const mgr = users.find((u) => u.id === managerId);
    const updatedUsers = users.map((u) =>
      u.id === employeeId ? { ...u, managerId, managerName: mgr?.name } : u
    );
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  const toggleUserActive = (userId: string) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  const updateUserPermissions = (userId: string, perms: Partial<UserPermissions>) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, permissions: { ...(u.permissions || {}), ...perms } } : u
    );
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  // Lead Activity Helper
  const addLeadActivity = (leadId: string, activity: Omit<LeadActivity, "id" | "timestamp">) => {
    const newAct: LeadActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      action: activity.action,
      channel: activity.channel,
      details: activity.details,
      actor: activity.actor || currentUser?.name || "System",
    };

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, activities: [newAct, ...(l.activities || [])] } : l))
    );
  };

  // Add Single Lead
  const addLead = (data: Partial<Lead>): Lead => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");

    const newId = `lead-${Date.now()}`;
    const initialActivity: LeadActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      action: "Lead Added",
      channel: "System",
      details: `Added manually by ${currentUser.name}`,
      actor: currentUser.name,
    };

    const newLead: Lead = {
      id: newId,
      agencyId: organization.id,
      name: data.name || "New Lead",
      company: data.company || "",
      email: data.email || "",
      phone: data.phone || "",
      whatsApp: data.whatsApp || data.phone || "",
      website: data.website || "",
      source: data.source || "Manual Entry",
      status: data.status || "New",
      notes: data.notes || "",
      tags: data.tags || ["Lead"],
      folderId: data.folderId,
      folderName: data.folderName,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      assignedEmployeeId: data.assignedEmployeeId || currentUser.id,
      assignedEmployeeName: data.assignedEmployeeName || currentUser.name,
      managerId: currentUser.role === "EMPLOYEE" ? currentUser.managerId : undefined,
      managerName: currentUser.role === "EMPLOYEE" ? currentUser.managerName : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [initialActivity],
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);

    if (newLead.folderId) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === newLead.folderId
            ? { ...f, leadCount: f.leadCount + 1, newCount: f.newCount + 1 }
            : f
        )
      );
    }

    persist(organization, currentUser, users, updatedLeads, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return newLead;
  };

  // Bulk Import Leads
  const bulkImportLeads = (
    leadRows: Array<{ name: string; company?: string; email?: string; phone?: string; whatsApp?: string; source?: string }>,
    folderName: string
  ): { importedCount: number; folderId: string } => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");

    const folderId = `folder-${Date.now()}`;
    const newFolder: LeadFolder = {
      id: folderId,
      agencyId: organization.id,
      name: folderName || `Imported Leads — ${new Date().toLocaleDateString()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
      leadCount: leadRows.length,
      newCount: leadRows.length,
      contactedCount: 0,
      interestedCount: 0,
      notInterestedCount: 0,
      convertedCount: 0,
    };

    const newLeads: Lead[] = leadRows.map((row, idx) => {
      const leadId = `lead-${Date.now()}-${idx}`;
      return {
        id: leadId,
        agencyId: organization.id,
        name: row.name || `Contact ${idx + 1}`,
        company: row.company || "",
        email: row.email || "",
        phone: row.phone || "",
        whatsApp: row.whatsApp || row.phone || "",
        source: row.source || "Excel/CSV Upload",
        status: "New",
        tags: ["Imported", folderName],
        folderId,
        folderName: newFolder.name,
        createdById: currentUser.id,
        createdByName: currentUser.name,
        assignedEmployeeId: currentUser.id,
        assignedEmployeeName: currentUser.name,
        managerId: currentUser.managerId,
        managerName: currentUser.managerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: `act-${leadId}`,
            timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            action: "Lead Added via Bulk Import",
            channel: "System",
            details: `Imported into folder '${newFolder.name}'`,
            actor: currentUser.name,
          },
        ],
      };
    });

    const updatedLeads = [...newLeads, ...leads];
    const updatedFolders = [newFolder, ...folders];

    setLeads(updatedLeads);
    setFolders(updatedFolders);

    persist(organization, currentUser, users, updatedLeads, updatedFolders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return { importedCount: newLeads.length, folderId };
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id === leadId) {
          const act: LeadActivity = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            action: `Status Changed to ${status}`,
            channel: "System",
            actor: currentUser?.name || "System",
          };
          return { ...l, status, updatedAt: new Date().toISOString(), activities: [act, ...(l.activities || [])] };
        }
        return l;
      });
      persist(organization, currentUser, users, updated, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
      return updated;
    });
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== leadId);
      persist(organization, currentUser, users, updated, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
      return updated;
    });
  };

  const addLeadToWorkflow = (leadId: string, workflowId: string): { success: boolean; message: string } => {
    const targetLead = leads.find((l) => l.id === leadId);
    const targetWf = workflows.find((w) => w.id === workflowId);

    if (!targetLead || !targetWf) {
      return { success: false, message: "Lead or workflow not found." };
    }

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const act: LeadActivity = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            action: `Added to Workflow: ${targetWf.name}`,
            channel: "Workflow",
            details: `Enrolled by ${currentUser?.name || "System"}`,
            actor: currentUser?.name || "System",
          };
          return { ...l, activeWorkflowId: workflowId, activeWorkflowName: targetWf.name, activities: [act, ...(l.activities || [])] };
        }
        return l;
      })
    );

    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, enrolledLeadsCount: w.enrolledLeadsCount + 1 } : w))
    );

    return { success: true, message: `Enrolled ${targetLead.name} into '${targetWf.name}'!` };
  };

  const createFolder = (name: string): LeadFolder => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");
    const newFolder: LeadFolder = {
      id: `folder-${Date.now()}`,
      agencyId: organization.id,
      name,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
      leadCount: 0,
      newCount: 0,
      contactedCount: 0,
      interestedCount: 0,
      notInterestedCount: 0,
      convertedCount: 0,
    };
    const updated = [newFolder, ...folders];
    setFolders(updated);
    persist(organization, currentUser, users, leads, updated, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return newFolder;
  };

  // Templates CRUD
  const createTemplate = (data: Omit<MarketingTemplate, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName">): MarketingTemplate => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");
    const newTpl: MarketingTemplate = {
      id: `tpl-${Date.now()}`,
      agencyId: organization.id,
      name: data.name,
      channel: data.channel,
      subject: data.subject,
      body: data.body,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [newTpl, ...templates];
    setTemplates(updated);
    persist(organization, currentUser, users, leads, folders, updated, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return newTpl;
  };

  const updateTemplate = (id: string, data: Partial<MarketingTemplate>) => {
    const updated = templates.map((t) => (t.id === id ? { ...t, ...data } : t));
    setTemplates(updated);
    persist(organization, currentUser, users, leads, folders, updated, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    persist(organization, currentUser, users, leads, folders, updated, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  // Campaigns CRUD
  const createCampaign = (data: Omit<Campaign, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName" | "sentCount" | "deliveredCount" | "openedCount" | "repliedCount" | "positiveResponses" | "negativeResponses" | "failedCount">): Campaign => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");
    const targetFolder = folders.find((f) => f.id === data.folderId);
    const targetTemplate = templates.find((t) => t.id === data.templateId);

    const newCampaign: Campaign = {
      id: `cmp-${Date.now()}`,
      agencyId: organization.id,
      name: data.name,
      folderId: data.folderId,
      folderName: targetFolder?.name || data.folderName,
      channel: data.channel,
      templateId: data.templateId,
      templateName: targetTemplate?.name || data.templateName,
      status: data.status || "Running",
      scheduledAt: data.scheduledAt,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      totalLeads: targetFolder?.leadCount || data.totalLeads || 0,
      sentCount: targetFolder?.leadCount || data.totalLeads || 0,
      deliveredCount: Math.round((targetFolder?.leadCount || data.totalLeads || 0) * 0.98),
      openedCount: data.channel === "Email" ? Math.round((targetFolder?.leadCount || data.totalLeads || 0) * 0.45) : undefined,
      repliedCount: 0,
      positiveResponses: 0,
      negativeResponses: 0,
      failedCount: 0,
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    persist(organization, currentUser, users, leads, folders, templates, updated, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return newCampaign;
  };

  const updateCampaignStatus = (campaignId: string, status: Campaign["status"]) => {
    const updated = campaigns.map((c) => (c.id === campaignId ? { ...c, status } : c));
    setCampaigns(updated);
    persist(organization, currentUser, users, leads, folders, templates, updated, workflows, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  // Workflows CRUD
  const createWorkflow = (data: Omit<Workflow, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName" | "enrolledLeadsCount">): Workflow => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      agencyId: organization.id,
      name: data.name,
      description: data.description,
      trigger: data.trigger,
      steps: data.steps,
      onPositiveResponse: data.onPositiveResponse,
      onNegativeResponse: data.onNegativeResponse,
      onNoResponse: data.onNoResponse,
      isActive: true,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      enrolledLeadsCount: 0,
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [newWf, ...workflows];
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return newWf;
  };

  const updateWorkflow = (id: string, data: Partial<Workflow>) => {
    const updated = workflows.map((w) => (w.id === id ? { ...w, ...data } : w));
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  const deleteWorkflow = (id: string) => {
    const updated = workflows.filter((w) => w.id !== id);
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  const toggleWorkflowActive = (workflowId: string) => {
    const updated = workflows.map((w) => (w.id === workflowId ? { ...w, isActive: !w.isActive } : w));
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, forms, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  // Lead Forms CRUD
  const createForm = (data: Omit<LeadForm, "id" | "agencyId" | "createdAt" | "createdById" | "createdByName" | "submissionCount">): LeadForm => {
    if (!organization || !currentUser) throw new Error("Unauthenticated");
    const targetFolder = folders.find((f) => f.id === data.folderId);
    const targetEmp = users.find((u) => u.id === data.assignedEmployeeId);
    const targetWf = workflows.find((w) => w.id === data.workflowId);

    const newForm: LeadForm = {
      id: `form-${Date.now()}`,
      agencyId: organization.id,
      title: data.title,
      description: data.description,
      submitButtonText: data.submitButtonText || "Submit Inquiry",
      successMessage: data.successMessage || "Thank you! We have received your request.",
      redirectUrl: data.redirectUrl,
      folderId: data.folderId,
      folderName: targetFolder?.name || data.folderName,
      assignedEmployeeId: data.assignedEmployeeId,
      assignedEmployeeName: targetEmp?.name || data.assignedEmployeeName,
      workflowId: data.workflowId,
      workflowName: targetWf?.name || data.workflowName,
      fields: data.fields,
      submissionCount: 0,
      isActive: true,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newForm, ...forms];
    setForms(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, updated, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
    return newForm;
  };

  const updateForm = (id: string, data: Partial<LeadForm>) => {
    const updated = forms.map((f) => (f.id === id ? { ...f, ...data } : f));
    setForms(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, updated, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  const deleteForm = (id: string) => {
    const updated = forms.filter((f) => f.id !== id);
    setForms(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, updated, responses, sentEmailLogs, smtpSettings, whatsAppSettings);
  };

  // Direct Submission Handler from Web Embeds / Public URL
  const submitLeadForm = async (
    formId: string,
    submission: Record<string, string>
  ): Promise<{ success: boolean; leadId?: string; message?: string; redirectUrl?: string }> => {
    const targetForm = forms.find((f) => f.id === formId);
    if (!targetForm) {
      return { success: false, message: "Form not found or has been removed." };
    }

    const assignedUser = users.find((u) => u.id === targetForm.assignedEmployeeId) || users[0];
    const newLeadId = `lead-${Date.now()}`;

    const leadName = submission.name || submission.fullName || submission["Full Name"] || "Web Prospect";
    const leadPhone = submission.phone || submission.whatsApp || submission["Phone Number"] || submission["WhatsApp Number"] || "";
    const leadEmail = submission.email || submission.workEmail || submission["Email Address"] || "";
    const leadCompany = submission.company || submission.businessName || submission["Company Name"] || "";
    const leadNotes = submission.notes || submission.message || submission.requirement || "";

    const customFields: Record<string, string> = {};
    for (const [key, val] of Object.entries(submission)) {
      if (!["name", "fullName", "phone", "whatsApp", "email", "company", "notes", "message"].includes(key)) {
        customFields[key] = val;
      }
    }

    const customSummary = Object.entries(customFields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const initialActivity: LeadActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      action: `Lead Captured via Web Form: ${targetForm.title}`,
      channel: "System",
      details: `Submitted online.${leadNotes ? ` Notes: ${leadNotes}` : ""}${customSummary ? ` [Custom Fields: ${customSummary}]` : ""}`,
      actor: "Web Form Ingestion",
    };

    const newLead: Lead = {
      id: newLeadId,
      agencyId: targetForm.agencyId,
      name: leadName,
      company: leadCompany,
      email: leadEmail,
      phone: leadPhone,
      whatsApp: leadPhone,
      source: `Web Form: ${targetForm.title}`,
      status: "New",
      notes: leadNotes ? `${leadNotes}${customSummary ? `\n\nAdditional Details: ${customSummary}` : ""}` : customSummary,
      customData: customFields,
      tags: ["Web Form", targetForm.title],
      folderId: targetForm.folderId,
      folderName: targetForm.folderName,
      createdById: targetForm.createdById,
      createdByName: targetForm.createdByName,
      assignedEmployeeId: assignedUser?.id || targetForm.createdById,
      assignedEmployeeName: assignedUser?.name || targetForm.createdByName,
      managerId: assignedUser?.managerId,
      managerName: assignedUser?.managerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [initialActivity],
    };

    if (targetForm.workflowId) {
      newLead.activeWorkflowId = targetForm.workflowId;
      newLead.activeWorkflowName = targetForm.workflowName;
      newLead.activities.unshift({
        id: `act-wf-${Date.now()}`,
        timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        action: `Enrolled in Workflow: ${targetForm.workflowName}`,
        channel: "Workflow",
        details: `Triggered automatically upon web form submission`,
        actor: "Automation Engine",
      });
    }

    const updatedLeads = [newLead, ...leads];
    const updatedForms = forms.map((f) => (f.id === formId ? { ...f, submissionCount: f.submissionCount + 1 } : f));

    setLeads(updatedLeads);
    setForms(updatedForms);

    // Sync directly with server endpoint
    fetch(`/api/v1/forms/${formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submission, redirectUrl: targetForm.redirectUrl }),
    }).catch(() => {});

    persist(
      organization,
      currentUser,
      users,
      updatedLeads,
      folders,
      templates,
      campaigns,
      workflows,
      updatedForms,
      responses,
      sentEmailLogs,
      smtpSettings,
      whatsAppSettings
    );

    return {
      success: true,
      leadId: newLeadId,
      message: targetForm.successMessage || "Thank you! Your submission was received.",
      redirectUrl: targetForm.redirectUrl,
    };
  };

  // Responses
  const recordResponse = (leadId: string, message: string, sentiment: "Positive" | "Negative" | "Question", channel: "WhatsApp" | "Email") => {
    const lead = leads.find((l) => l.id === leadId);
    const newResp: LeadResponse = {
      id: `resp-${Date.now()}`,
      leadId,
      leadName: lead?.name || "Lead",
      leadPhone: lead?.phone,
      leadEmail: lead?.email,
      channel,
      message,
      sentiment,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      handled: false,
    };

    setResponses((prev) => [newResp, ...prev]);

    if (sentiment === "Positive") {
      updateLeadStatus(leadId, "Interested");
      addLeadActivity(leadId, {
        action: "Positive Response Received",
        channel,
        details: `Customer replied: '${message}' ➔ Status set to Interested & automated workflow paused.`,
        actor: "Response Tracker",
      });
    } else if (sentiment === "Negative") {
      updateLeadStatus(leadId, "Not Interested");
      addLeadActivity(leadId, {
        action: "Negative Response Received",
        channel,
        details: `Customer replied: '${message}' ➔ Status set to Not Interested & campaign stopped.`,
        actor: "Response Tracker",
      });
    }
  };

  const markResponseHandled = (responseId: string) => {
    setResponses((prev) => prev.map((r) => (r.id === responseId ? { ...r, handled: true } : r)));
  };

  const saveSMTPSettings = (settings: Partial<SMTPSettings>) => {
    const updated = { ...smtpSettings, ...settings, isConfigured: true };
    setSmtpSettings(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, updated, whatsAppSettings);
  };

  const saveWhatsAppSettings = (settings: Partial<WhatsAppAPISettings>) => {
    const updated = { ...whatsAppSettings, ...settings, isConfigured: true };
    setWhatsAppSettings(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, forms, responses, sentEmailLogs, smtpSettings, updated);
  };

  const sendRealEmail = async (data: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    customSmtp?: SMTPSettings;
  }): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const activeSmtp = data.customSmtp || smtpSettings;
      const res = await fetch("/api/v1/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpSettings: activeSmtp,
          to: data.to,
          subject: data.subject,
          text: data.text,
          html: data.html,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.error || "Failed to send email", error: json.error };
      }
      return { success: true, message: json.message || "Email delivered successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error sending email", error: String(err) };
    }
  };

  const sendRealWhatsApp = async (data: {
    to: string;
    message: string;
    customSettings?: WhatsAppAPISettings;
  }): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const activeWa = data.customSettings || whatsAppSettings;
      const res = await fetch("/api/v1/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappSettings: activeWa,
          to: data.to,
          message: data.message,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.error || "Failed to send WhatsApp message", error: json.error };
      }
      return { success: true, message: json.message || "WhatsApp message delivered successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error sending WhatsApp message", error: String(err) };
    }
  };

  return (
    <FlowDeskStoreContext.Provider
      value={{
        organization,
        currentUser,
        users,
        leads,
        scopedLeads,
        folders,
        templates,
        campaigns,
        workflows,
        forms,
        responses,
        sentEmailLogs,
        smtpSettings,
        whatsAppSettings,
        createAgency,
        login,
        logout,
        switchUser,
        resetAll,
        updateUserProfile,
        createManager,
        createEmployee,
        assignEmployeeToManager,
        toggleUserActive,
        updateUserPermissions,
        addLead,
        bulkImportLeads,
        updateLeadStatus,
        deleteLead,
        addLeadActivity,
        addLeadToWorkflow,
        createFolder,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        createCampaign,
        updateCampaignStatus,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        toggleWorkflowActive,
        createForm,
        updateForm,
        deleteForm,
        submitLeadForm,
        recordResponse,
        markResponseHandled,
        saveSMTPSettings,
        saveWhatsAppSettings,
        sendRealEmail,
        sendRealWhatsApp,
        syncLeadsWithServer,
      }}
    >
      {children}
    </FlowDeskStoreContext.Provider>
  );
}

export function useFlowDesk() {
  const context = useContext(FlowDeskStoreContext);
  if (!context) {
    throw new Error("useFlowDesk must be used within a FlowDeskStoreProvider");
  }
  return context;
}

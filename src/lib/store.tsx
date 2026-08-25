"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Organization,
  User,
  UserRole,
  UserPermissions,
  Lead,
  LeadStatus,
  LeadFolder,
  MarketingTemplate,
  Campaign,
  Workflow,
  WorkflowStep,
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
  responses: LeadResponse[];
  smtpSettings: SMTPSettings;
  whatsAppSettings: WhatsAppAPISettings;

  // Auth & Agency Operations
  createAgency: (data: { agencyName: string; adminName: string; adminEmail: string }) => Promise<Organization>;
  joinAgency: (data: { joinCode: string; name: string; email: string; role: "MANAGER" | "EMPLOYEE"; managerId?: string }) => Promise<{ success: boolean; message: string }>;
  login: (email: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  resetAll: () => void;

  // User & Team Management
  createManager: (data: { name: string; email: string }) => User;
  createEmployee: (data: { name: string; email: string; managerId?: string }) => User;
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

  // Responses
  recordResponse: (leadId: string, message: string, sentiment: "Positive" | "Negative" | "Question", channel: "WhatsApp" | "Email") => void;
  markResponseHandled: (responseId: string) => void;

  // Settings
  saveSMTPSettings: (settings: Partial<SMTPSettings>) => void;
  saveWhatsAppSettings: (settings: Partial<WhatsAppAPISettings>) => void;
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

export function FlowDeskStoreProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [folders, setFolders] = useState<LeadFolder[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [responses, setResponses] = useState<LeadResponse[]>([]);
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
      const savedResponses = localStorage.getItem("fd_marketing_responses");
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
      if (savedResponses) setResponses(JSON.parse(savedResponses));
      if (savedSmtp) setSmtpSettings(JSON.parse(savedSmtp));
      if (savedWa) setWhatsAppSettings(JSON.parse(savedWa));
    } catch (err) {
      console.warn("Storage hydration failed:", err);
    }
  }, []);

  const persist = (
    org: Organization | null,
    u: User | null,
    uList: User[],
    lList: Lead[],
    fList: LeadFolder[],
    tList: MarketingTemplate[],
    cList: Campaign[],
    wList: Workflow[],
    rList: LeadResponse[],
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
        localStorage.setItem("fd_marketing_responses", JSON.stringify(rList));
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
              templates: tList,
              workflows: wList,
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
  }: {
    agencyName: string;
    adminName: string;
    adminEmail: string;
  }): Promise<Organization> => {
    const orgId = `org-${Date.now()}`;
    const code = `${agencyName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminId = `usr-admin-${Date.now()}`;

    const adminUser: User = {
      id: adminId,
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      role: "ADMIN",
      agencyId: orgId,
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

    setOrganization(newOrg);
    setCurrentUser(adminUser);
    setUsers([adminUser]);
    setLeads([]);
    setFolders([]);
    setTemplates(starterTemplates);
    setCampaigns([]);
    setWorkflows([starterWorkflow]);
    setResponses([]);

    persist(
      newOrg,
      adminUser,
      [adminUser],
      [],
      [],
      starterTemplates,
      [],
      [starterWorkflow],
      [],
      smtpSettings,
      whatsAppSettings
    );

    return newOrg;
  };

  // Join Agency (Manager or Employee) with cross-tab / incognito server fallback
  const joinAgency = async ({
    joinCode,
    name,
    email,
    role,
    managerId,
  }: {
    joinCode: string;
    name: string;
    email: string;
    role: "MANAGER" | "EMPLOYEE";
    managerId?: string;
  }): Promise<{ success: boolean; message: string }> => {
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

    const cleanInputCode = joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // If local targetOrg code does not match or is missing, fetch from global server API
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
        console.warn("API join lookup failed:", err);
      }
    }

    if (!targetOrg) {
      return {
        success: false,
        message: `No active agency found with Join Code "${joinCode}". Please create an agency first or check the code with your Admin.`,
      };
    }

    const cleanOrgCode = targetOrg.joinCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleanInputCode !== cleanOrgCode) {
      return {
        success: false,
        message: `Invalid Agency Join Code. The active code for ${targetOrg.name} is "${targetOrg.joinCode}".`,
      };
    }

    const assignedManager = (targetOrg as any).users?.find((u: any) => u.id === managerId) || users.find((u) => u.id === managerId);

    const newUser: User = {
      id: `usr-${role.toLowerCase()}-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      agencyId: targetOrg.id,
      managerId: role === "EMPLOYEE" ? managerId : undefined,
      managerName: role === "EMPLOYEE" ? assignedManager?.name : undefined,
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

    const existingUsers = (targetOrg as any).users || users;
    const updatedUsers = [...existingUsers.filter((u: any) => u.email.toLowerCase() !== newUser.email), newUser];
    const updatedTemplates = (targetOrg as any).templates || templates;
    const updatedWorkflows = (targetOrg as any).workflows || workflows;

    setOrganization(targetOrg);
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    if (templates.length === 0 && updatedTemplates.length > 0) setTemplates(updatedTemplates);
    if (workflows.length === 0 && updatedWorkflows.length > 0) setWorkflows(updatedWorkflows);

    persist(
      targetOrg,
      newUser,
      updatedUsers,
      leads,
      folders,
      updatedTemplates,
      campaigns,
      updatedWorkflows,
      responses,
      smtpSettings,
      whatsAppSettings
    );

    return { success: true, message: `Successfully joined ${targetOrg.name} as ${role}!` };
  };

  const login = (email: string): { success: boolean; message: string } => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: "User not found with this email." };
    }
    if (!user.isActive) {
      return { success: false, message: "This user account has been deactivated by the Admin." };
    }
    setCurrentUser(user);
    persist(
      organization,
      user,
      users,
      leads,
      folders,
      templates,
      campaigns,
      workflows,
      responses,
      smtpSettings,
      whatsAppSettings
    );
    return { success: true, message: `Welcome back, ${user.name}!` };
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
        responses,
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
    setResponses([]);
    localStorage.clear();
  };

  // User Management
  const createManager = (data: { name: string; email: string }): User => {
    if (!organization) throw new Error("No active agency");
    const newMgr: User = {
      id: `usr-mgr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: "MANAGER",
      agencyId: organization.id,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newMgr];
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
    return newMgr;
  };

  const createEmployee = (data: { name: string; email: string; managerId?: string }): User => {
    if (!organization) throw new Error("No active agency");
    const mgr = users.find((u) => u.id === data.managerId);
    const newEmp: User = {
      id: `usr-emp-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: "EMPLOYEE",
      agencyId: organization.id,
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
    const updatedUsers = [...users, newEmp];
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
    return newEmp;
  };

  const assignEmployeeToManager = (employeeId: string, managerId: string) => {
    const mgr = users.find((u) => u.id === managerId);
    const updatedUsers = users.map((u) =>
      u.id === employeeId ? { ...u, managerId, managerName: mgr?.name } : u
    );
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
  };

  const toggleUserActive = (userId: string) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
  };

  const updateUserPermissions = (userId: string, perms: Partial<UserPermissions>) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, permissions: { ...(u.permissions || {}), ...perms } } : u
    );
    setUsers(updatedUsers);
    persist(organization, currentUser, updatedUsers, leads, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
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

    persist(organization, currentUser, users, updatedLeads, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
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

    persist(organization, currentUser, users, updatedLeads, updatedFolders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
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
      persist(organization, currentUser, users, updated, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
      return updated;
    });
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== leadId);
      persist(organization, currentUser, users, updated, folders, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
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
    persist(organization, currentUser, users, leads, updated, templates, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
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
    persist(organization, currentUser, users, leads, folders, updated, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
    return newTpl;
  };

  const updateTemplate = (id: string, data: Partial<MarketingTemplate>) => {
    const updated = templates.map((t) => (t.id === id ? { ...t, ...data } : t));
    setTemplates(updated);
    persist(organization, currentUser, users, leads, folders, updated, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    persist(organization, currentUser, users, leads, folders, updated, campaigns, workflows, responses, smtpSettings, whatsAppSettings);
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
    persist(organization, currentUser, users, leads, folders, templates, updated, workflows, responses, smtpSettings, whatsAppSettings);
    return newCampaign;
  };

  const updateCampaignStatus = (campaignId: string, status: Campaign["status"]) => {
    const updated = campaigns.map((c) => (c.id === campaignId ? { ...c, status } : c));
    setCampaigns(updated);
    persist(organization, currentUser, users, leads, folders, templates, updated, workflows, responses, smtpSettings, whatsAppSettings);
  };

  // Workflows CRUD (Manageable by Admin, Manager, and Employee)
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
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, responses, smtpSettings, whatsAppSettings);
    return newWf;
  };

  const updateWorkflow = (id: string, data: Partial<Workflow>) => {
    const updated = workflows.map((w) => (w.id === id ? { ...w, ...data } : w));
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, responses, smtpSettings, whatsAppSettings);
  };

  const deleteWorkflow = (id: string) => {
    const updated = workflows.filter((w) => w.id !== id);
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, responses, smtpSettings, whatsAppSettings);
  };

  const toggleWorkflowActive = (workflowId: string) => {
    const updated = workflows.map((w) => (w.id === workflowId ? { ...w, isActive: !w.isActive } : w));
    setWorkflows(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, updated, responses, smtpSettings, whatsAppSettings);
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
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, responses, updated, whatsAppSettings);
  };

  const saveWhatsAppSettings = (settings: Partial<WhatsAppAPISettings>) => {
    const updated = { ...whatsAppSettings, ...settings, isConfigured: true };
    setWhatsAppSettings(updated);
    persist(organization, currentUser, users, leads, folders, templates, campaigns, workflows, responses, smtpSettings, updated);
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
        responses,
        smtpSettings,
        whatsAppSettings,
        createAgency,
        joinAgency,
        login,
        logout,
        switchUser,
        resetAll,
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
        recordResponse,
        markResponseHandled,
        saveSMTPSettings,
        saveWhatsAppSettings,
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

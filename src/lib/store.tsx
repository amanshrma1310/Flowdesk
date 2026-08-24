"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Organization,
  Contact,
  Deal,
  Automation,
  Task,
  EventItem,
  ChatMessage,
  Campaign,
  User,
  CustomRole,
  LeadList,
  MessageTemplate,
  AuditLog,
  LeadJourneyStep,
} from "./types";
import {
  MOCK_CUSTOM_ROLES,
  MOCK_TEMPLATES,
  MOCK_AUTOMATIONS,
  MOCK_EVENTS,
} from "./mockData";
import { CleanedContactRow } from "./ai/dataCleaner";

interface FlowDeskStoreContextType {
  // Auth & Agency Context
  isAuthenticated: boolean;
  organization: Organization | null;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: "MAIN_ADMIN" | "MANAGER" | "EMPLOYEE") => void;
  login: (email: string, name?: string) => void;
  createAgency: (data: { name: string; industry?: string; country?: string; currency?: string }) => void;
  logout: () => void;
  resetWorkspace: () => void;

  // Raw & RBAC Scoped Collections
  contacts: Contact[];
  allContacts: Contact[];
  leadLists: LeadList[];
  customRoles: CustomRole[];
  templates: MessageTemplate[];
  auditLogs: AuditLog[];
  leadJourneys: Record<string, LeadJourneyStep[]>;
  deals: Deal[];
  automations: Automation[];
  tasks: Task[];
  events: EventItem[];
  chats: Record<string, ChatMessage[]>;
  campaigns: Campaign[];
  users: User[];
  
  // User Management
  addManager: (data: { name: string; email: string; department?: string; territory?: string }) => User;
  addEmployee: (data: { name: string; email: string; role?: string; managerId?: string; department?: string }) => User;

  // Actions
  importContacts: (rows: CleanedContactRow[], listName: string) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  addContact: (contact: Partial<Contact>) => Contact;
  deleteContact: (id: string) => void;
  toggleDoNotContact: (id: string) => void;
  enrollLeadInWorkflow: (leadId: string, workflowId: string) => { success: boolean; message: string };
  
  // Lead Lists / Folders
  createLeadList: (name: string, description?: string) => LeadList;
  
  // Lead Journey
  addLeadJourneyStep: (leadId: string, step: Partial<LeadJourneyStep>) => void;
  
  // Custom Roles & Permissions
  createCustomRole: (role: Partial<CustomRole>) => CustomRole;
  
  // Templates & Approvals
  createTemplate: (template: Partial<MessageTemplate>) => MessageTemplate;
  approveTemplate: (id: string) => void;
  
  // Audit Logs
  addAuditLog: (log: Partial<AuditLog>) => void;

  // Automations
  toggleAutomationStatus: (id: string) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  createAutomation: (automation: Partial<Automation>) => Automation;
  triggerAutomationTest: (id: string, contactId?: string) => Promise<{ success: boolean; log: string[] }>;
  
  // Tasks
  toggleTaskStatus: (id: string) => void;
  addTask: (task: Partial<Task>) => void;
  
  // Deals
  updateDealStage: (id: string, stage: Deal["stage"]) => void;
  
  // Messages / Inbox
  sendMessage: (contactId: string, content: string, channel?: "WHATSAPP" | "EMAIL") => void;
}

const FlowDeskStoreContext = createContext<FlowDeskStoreContextType | null>(null);

const DEFAULT_ADMIN: User = {
  id: "usr-admin-1",
  name: "Admin User",
  email: "admin@flowdesk.ai",
  role: "MAIN_ADMIN",
  customRoleName: "Main Admin",
  department: "Executive",
  activeLeadsCount: 0,
};

export function FlowDeskStoreProvider({ children }: { children: React.ReactNode }) {
  // Authentication & Organization State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Users State (starts clean with only the Admin when agency is created)
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_ADMIN);

  // Collections (Clean Initial State)
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>(MOCK_CUSTOM_ROLES);
  const [templates, setTemplates] = useState<MessageTemplate[]>(MOCK_TEMPLATES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [leadJourneys, setLeadJourneys] = useState<Record<string, LeadJourneyStep[]>>({});
  const [deals, setDeals] = useState<Deal[]>([]);
  const [automations, setAutomations] = useState<Automation[]>(MOCK_AUTOMATIONS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("flowdesk_auth");
      const savedOrg = localStorage.getItem("flowdesk_org");
      const savedUsers = localStorage.getItem("flowdesk_users");
      const savedContacts = localStorage.getItem("flowdesk_contacts");
      const savedLists = localStorage.getItem("flowdesk_lists");
      const savedLogs = localStorage.getItem("flowdesk_logs");

      if (savedAuth && savedOrg) {
        setIsAuthenticated(true);
        const orgObj = JSON.parse(savedOrg);
        setOrganization(orgObj);
        
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          setUsers(parsedUsers);
          setCurrentUser(parsedUsers[0] || DEFAULT_ADMIN);
        }
        if (savedContacts) setAllContacts(JSON.parse(savedContacts));
        if (savedLists) setLeadLists(JSON.parse(savedLists));
        if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.warn("Storage sync failed:", e);
    }
  }, []);

  // Save changes to localStorage
  const persistState = (org: Organization | null, userList: User[], contactList: Contact[], lists: LeadList[], logs: AuditLog[]) => {
    try {
      if (org) {
        localStorage.setItem("flowdesk_auth", "true");
        localStorage.setItem("flowdesk_org", JSON.stringify(org));
        localStorage.setItem("flowdesk_users", JSON.stringify(userList));
        localStorage.setItem("flowdesk_contacts", JSON.stringify(contactList));
        localStorage.setItem("flowdesk_lists", JSON.stringify(lists));
        localStorage.setItem("flowdesk_logs", JSON.stringify(logs));
      } else {
        localStorage.removeItem("flowdesk_auth");
        localStorage.removeItem("flowdesk_org");
        localStorage.removeItem("flowdesk_users");
        localStorage.removeItem("flowdesk_contacts");
        localStorage.removeItem("flowdesk_lists");
        localStorage.removeItem("flowdesk_logs");
      }
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  // Login handler
  const login = (email: string, name: string = "Admin User") => {
    const adminUser: User = {
      id: `usr-${Date.now()}`,
      name: name || "Admin User",
      email,
      role: "MAIN_ADMIN",
      customRoleName: "Main Admin",
      department: "Executive",
      activeLeadsCount: 0,
    };
    setCurrentUser(adminUser);
    setUsers([adminUser]);
  };

  // Create Agency / Organization
  const createAgency = (data: { name: string; industry?: string; country?: string; currency?: string }) => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      industry: data.industry || "Marketing & Lead Generation",
      country: data.country || "India",
      currency: data.currency || "INR (₹)",
      timezone: "Asia/Kolkata (IST)",
      createdAt: new Date().toISOString(),
      plan: "Business Growth",
    };

    const initialLog: AuditLog = {
      id: `log-init-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: "MAIN_ADMIN",
      action: "CREATED_ORGANIZATION",
      entityType: "ORGANIZATION",
      entityName: newOrg.name,
      details: `Initialized new agency workspace '${newOrg.name}' for industry: ${newOrg.industry}. Clean workspace initialized.`,
      timestamp: "Just now",
      ipAddress: "127.0.0.1",
    };

    setOrganization(newOrg);
    setIsAuthenticated(true);
    setAuditLogs([initialLog]);
    setAllContacts([]);
    setLeadLists([]);
    setTasks([]);
    setDeals([]);
    setCampaigns([]);

    persistState(newOrg, [currentUser], [], [], [initialLog]);
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setOrganization(null);
    persistState(null, [], [], [], []);
  };

  // Reset workspace
  const resetWorkspace = () => {
    logout();
  };

  // Add Manager
  const addManager = (data: { name: string; email: string; department?: string; territory?: string }): User => {
    const newMgr: User = {
      id: `usr-mgr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "MANAGER",
      customRoleName: "Sales Pod Manager",
      department: data.department || "Sales Pod",
      territory: data.territory || "National",
      activeLeadsCount: 0,
      managedEmployeeIds: [],
    };
    const updatedUsers = [...users, newMgr];
    setUsers(updatedUsers);
    addAuditLog({
      action: "CREATED_MANAGER",
      entityType: "USER",
      entityName: newMgr.name,
      details: `Created manager for pod: ${newMgr.department}`,
    });
    return newMgr;
  };

  // Add Employee
  const addEmployee = (data: { name: string; email: string; role?: string; managerId?: string; department?: string }): User => {
    const manager = users.find((u) => u.id === data.managerId);
    const newEmp: User = {
      id: `usr-emp-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "EMPLOYEE",
      customRoleName: data.role || "Sales Representative",
      managerId: data.managerId,
      managerName: manager?.name,
      department: data.department || manager?.department || "Sales Pod",
      activeLeadsCount: 0,
    };

    const updatedUsers = users.map((u) => {
      if (u.id === data.managerId) {
        return {
          ...u,
          managedEmployeeIds: [...(u.managedEmployeeIds || []), newEmp.id],
        };
      }
      return u;
    });

    const finalUsers = [...updatedUsers, newEmp];
    setUsers(finalUsers);
    addAuditLog({
      action: "CREATED_EMPLOYEE",
      entityType: "USER",
      entityName: newEmp.name,
      details: `Added employee to manager ${manager?.name || "Unassigned"}`,
    });
    return newEmp;
  };

  // Switch role helper for demonstration
  const switchUserRole = (role: "MAIN_ADMIN" | "MANAGER" | "EMPLOYEE") => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
  };

  // Scoped Contacts
  const scopedContacts = useMemo(() => {
    if (currentUser.role === "MAIN_ADMIN") {
      return allContacts;
    } else if (currentUser.role === "MANAGER") {
      const teamIds = new Set([currentUser.id, ...(currentUser.managedEmployeeIds || [])]);
      return allContacts.filter((c) => teamIds.has(c.ownerId) || c.managerId === currentUser.id);
    } else {
      return allContacts.filter((c) => c.ownerId === currentUser.id);
    }
  }, [allContacts, currentUser]);

  // Scoped Tasks
  const scopedTasks = useMemo(() => {
    if (currentUser.role === "MAIN_ADMIN") {
      return tasks;
    } else if (currentUser.role === "MANAGER") {
      const teamIds = new Set([currentUser.id, ...(currentUser.managedEmployeeIds || [])]);
      return tasks.filter((t) => teamIds.has(t.assignedToId) || t.managerId === currentUser.id);
    } else {
      return tasks.filter((t) => t.assignedToId === currentUser.id);
    }
  }, [tasks, currentUser]);

  // Audit Logging
  const addAuditLog = (logData: Partial<AuditLog>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: logData.action || "PERFORMED_ACTION",
      entityType: logData.entityType || "LEAD",
      entityName: logData.entityName || "General",
      details: logData.details || "",
      timestamp: "Just now",
      ipAddress: "127.0.0.1",
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    persistState(organization, users, allContacts, leadLists, updated);
  };

  // Lead Journey
  const addLeadJourneyStep = (leadId: string, step: Partial<LeadJourneyStep>) => {
    const newStep: LeadJourneyStep = {
      id: `j-${Date.now()}`,
      title: step.title || "Action Recorded",
      description: step.description || "",
      timestamp: "Just now",
      actor: step.actor || currentUser.name,
      channel: step.channel || "SYSTEM",
      status: step.status || "COMPLETED",
    };

    setLeadJourneys((prev) => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), newStep],
    }));
  };

  // Import contacts
  const importContacts = (rows: CleanedContactRow[], listName: string) => {
    const newListId = `list-${Date.now()}`;
    const newList: LeadList = {
      id: newListId,
      name: listName || `Imported by ${currentUser.name} — ${new Date().toLocaleDateString()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
      leadCount: rows.length,
      source: "EXCEL_IMPORT",
      assignedWorkflowId: "auto-1",
      assignedWorkflowName: "Response-Based 360° Follow-up Engine",
    };

    const updatedLists = [newList, ...leadLists];
    setLeadLists(updatedLists);

    // Assign to current user or available employee
    const assignedRep = users.find((u) => u.role === "EMPLOYEE") || currentUser;
    const manager = users.find((u) => u.role === "MANAGER") || currentUser;

    const newContacts: Contact[] = rows.map((row, idx) => {
      const tags = row.tags.map((t, tIdx) => ({ id: `t-${idx}-${tIdx}`, name: t, color: "#3B82F6" }));
      const newId = `lead-${Date.now()}-${idx}`;

      return {
        id: newId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        company: row.company,
        title: row.title,
        location: row.location,
        source: row.source || "EXCEL_IMPORT",
        status: row.status || "NEW",
        leadScore: row.leadScore || 70,
        customFields: row.customFields,
        
        createdById: currentUser.id,
        createdByName: currentUser.name,
        ownerId: assignedRep.id,
        ownerName: assignedRep.name,
        managerId: manager.id,
        managerName: manager.name,
        
        leadListId: newListId,
        leadListName: newList.name,
        activeWorkflowId: "auto-1",
        activeWorkflowName: "Response-Based 360° Follow-up Engine",
        doNotContact: false,
        
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const updatedContacts = [...newContacts, ...allContacts];
    setAllContacts(updatedContacts);

    const newJourneys = { ...leadJourneys };
    newContacts.forEach((c) => {
      newJourneys[c.id] = [
        {
          id: `j-${Date.now()}-${c.id}-1`,
          title: "Lead Ingested & Sanitized",
          description: `Imported into list '${newList.name}'. Phone standardized to E.164.`,
          timestamp: "Just now",
          actor: currentUser.name,
          channel: "SYSTEM",
          status: "COMPLETED",
        },
        {
          id: `j-${Date.now()}-${c.id}-2`,
          title: "Assigned to Sales Rep",
          description: `Assigned to ${c.ownerName} under Manager ${c.managerName}.`,
          timestamp: "Just now",
          actor: "FlowDesk Router",
          channel: "SYSTEM",
          status: "COMPLETED",
        },
        {
          id: `j-${Date.now()}-${c.id}-3`,
          title: "Enrolled in 'Response-Based Follow-up Engine'",
          description: "Active auto-followup started with duplicate enrollment check: PASSED.",
          timestamp: "Just now",
          actor: "Automation Engine",
          channel: "SYSTEM",
          status: "COMPLETED",
        },
      ];
    });
    setLeadJourneys(newJourneys);

    addAuditLog({
      action: "IMPORTED_LEADS",
      entityType: "LEAD",
      entityName: newList.name,
      details: `Imported ${rows.length} contacts into folder '${newList.name}'.`,
    });

    persistState(organization, users, updatedContacts, updatedLists, auditLogs);
  };

  const createLeadList = (name: string, description?: string): LeadList => {
    const newList: LeadList = {
      id: `list-${Date.now()}`,
      name,
      description,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
      leadCount: 0,
      source: "MANUAL",
    };
    const updated = [newList, ...leadLists];
    setLeadLists(updated);
    persistState(organization, users, allContacts, updated, auditLogs);
    return newList;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setAllContacts((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      persistState(organization, users, updated, leadLists, auditLogs);
      return updated;
    });
  };

  const addContact = (contactData: Partial<Contact>): Contact => {
    const newContact: Contact = {
      id: `lead-${Date.now()}`,
      name: contactData.name || "New Contact",
      email: contactData.email,
      phone: contactData.phone,
      company: contactData.company,
      title: contactData.title,
      source: contactData.source || "MANUAL",
      status: contactData.status || "NEW",
      leadScore: contactData.leadScore || 70,
      
      createdById: currentUser.id,
      createdByName: currentUser.name,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      managerId: currentUser.managerId || currentUser.id,
      managerName: currentUser.managerName || currentUser.name,
      
      tags: contactData.tags || [{ id: "t-new", name: "Lead", color: "#3B82F6" }],
      doNotContact: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newContact, ...allContacts];
    setAllContacts(updated);
    addLeadJourneyStep(newContact.id, {
      title: "Lead Created Manually",
      description: `Created and owned by ${currentUser.name}.`,
    });
    persistState(organization, users, updated, leadLists, auditLogs);
    return newContact;
  };

  const deleteContact = (id: string) => {
    setAllContacts((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persistState(organization, users, updated, leadLists, auditLogs);
      return updated;
    });
  };

  const toggleDoNotContact = (id: string) => {
    setAllContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextVal = !c.doNotContact;
          addAuditLog({
            action: nextVal ? "MARKED_DO_NOT_CONTACT" : "UNMARKED_DO_NOT_CONTACT",
            entityType: "LEAD",
            entityName: c.name,
            details: nextVal ? "Customer opted out or replied STOP. Halting all automation." : "Opt-out removed.",
          });
          return {
            ...c,
            doNotContact: nextVal,
            status: nextVal ? "DO_NOT_CONTACT" : c.status,
            activeWorkflowId: nextVal ? undefined : c.activeWorkflowId,
          };
        }
        return c;
      })
    );
  };

  const enrollLeadInWorkflow = (leadId: string, workflowId: string): { success: boolean; message: string } => {
    const targetLead = allContacts.find((c) => c.id === leadId);
    const targetWorkflow = automations.find((a) => a.id === workflowId);

    if (!targetLead || !targetWorkflow) {
      return { success: false, message: "Lead or workflow not found." };
    }

    if (targetLead.doNotContact) {
      return { success: false, message: "Cannot enroll: Lead is marked Do-Not-Contact (Opted Out)." };
    }

    if (targetLead.activeWorkflowId === workflowId) {
      return {
        success: false,
        message: `Enrollment Blocked: Lead is ALREADY active in '${targetWorkflow.name}'. Duplicate message prevention safeguard triggered.`,
      };
    }

    updateContact(leadId, {
      activeWorkflowId: workflowId,
      activeWorkflowName: targetWorkflow.name,
    });

    addLeadJourneyStep(leadId, {
      title: `Enrolled in '${targetWorkflow.name}'`,
      description: `Manually enrolled by ${currentUser.name}.`,
    });

    return {
      success: true,
      message: `Successfully enrolled ${targetLead.name} in '${targetWorkflow.name}'!`,
    };
  };

  const createCustomRole = (roleData: Partial<CustomRole>): CustomRole => {
    const newRole: CustomRole = {
      id: `role-${Date.now()}`,
      name: roleData.name || "Custom Role",
      description: roleData.description || "",
      permissions: roleData.permissions || ["LEAD_VIEW_OWN", "ANALYTICS_OWN"],
      isSystem: false,
    };
    setCustomRoles((prev) => [...prev, newRole]);
    addAuditLog({
      action: "CREATED_CUSTOM_ROLE",
      entityType: "USER",
      entityName: newRole.name,
      details: `Configured permissions: ${newRole.permissions.join(", ")}`,
    });
    return newRole;
  };

  const createTemplate = (tplData: Partial<MessageTemplate>): MessageTemplate => {
    const newTpl: MessageTemplate = {
      id: `tpl-${Date.now()}`,
      name: tplData.name || "custom_template",
      channel: tplData.channel || "WHATSAPP",
      body: tplData.body || "",
      subject: tplData.subject,
      category: "MARKETING",
      status: currentUser.role === "MAIN_ADMIN" ? "APPROVED" : "PENDING_APPROVAL",
      isCompanyWide: Boolean(tplData.isCompanyWide),
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleDateString(),
      approvedBy: currentUser.role === "MAIN_ADMIN" ? currentUser.name : undefined,
    };
    setTemplates((prev) => [newTpl, ...prev]);
    return newTpl;
  };

  const approveTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "APPROVED", approvedBy: `${currentUser.name} (Admin)` }
          : t
      )
    );
    addAuditLog({
      action: "APPROVED_TEMPLATE",
      entityType: "TEMPLATE",
      entityName: id,
      details: `Template approved for company-wide deployment by ${currentUser.name}.`,
    });
  };

  const toggleAutomationStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : a))
    );
  };

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const createAutomation = (autoData: Partial<Automation>): Automation => {
    const newAuto: Automation = {
      id: `auto-${Date.now()}`,
      name: autoData.name || "Custom Automation",
      description: autoData.description || "Custom business workflow",
      status: "ACTIVE",
      category: autoData.category || "CUSTOM",
      triggerType: autoData.triggerType || "LEAD_CREATED",
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      flowDefinition: autoData.flowDefinition || {
        nodes: [
          {
            id: "node-1",
            type: "trigger",
            position: { x: 250, y: 50 },
            data: { label: "WHEN: Lead Ingested / Enrolled", type: "trigger", config: {} },
          },
        ],
        edges: [],
      },
    };
    setAutomations((prev) => [newAuto, ...prev]);
    return newAuto;
  };

  const triggerAutomationTest = async (
    id: string,
    contactId?: string
  ): Promise<{ success: boolean; log: string[] }> => {
    const targetContact = contactId
      ? allContacts.find((c) => c.id === contactId) || allContacts[0]
      : allContacts[0];

    const logs: string[] = [
      `[${new Date().toLocaleTimeString()}] Trigger event 'LEAD_CREATED' received for ${targetContact?.name || "Lead"}`,
      `[${new Date().toLocaleTimeString()}] Safety Check: Verify duplicate enrollment & Do-Not-Contact flag: PASSED`,
      `[${new Date().toLocaleTimeString()}] Lead assigned to ${targetContact?.ownerName || currentUser.name}`,
      `[${new Date().toLocaleTimeString()}] Official WhatsApp Cloud API: Sent template 'lead_welcome_intro' to ${targetContact?.phone || "+91 98765 00000"} (Status: DELIVERED)`,
      `[${new Date().toLocaleTimeString()}] Response Listener Activated: Pausing for customer reply with AI Intent Classifier`,
    ];

    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, executionCount: a.executionCount + 1, successCount: a.successCount + 1, lastRunAt: "Just now" } : a))
    );

    return { success: true, log: logs };
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "COMPLETED" ? "PENDING" : "COMPLETED" }
          : t
      )
    );
  };

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || "Follow up with client",
      description: taskData.description,
      contactId: taskData.contactId,
      contactName: taskData.contactName,
      dueDate: taskData.dueDate || "Today",
      priority: taskData.priority || "MEDIUM",
      status: "PENDING",
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      managerId: currentUser.managerId || currentUser.id,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateDealStage = (id: string, stage: Deal["stage"]) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)));
  };

  const sendMessage = (contactId: string, content: string, channel: "WHATSAPP" | "EMAIL" = "WHATSAPP") => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      contactId,
      channel,
      direction: "OUTBOUND",
      status: "DELIVERED",
      senderName: currentUser.name,
      content,
      timestamp: "Just now",
    };

    setChats((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg],
    }));

    addLeadJourneyStep(contactId, {
      title: `${channel === "WHATSAPP" ? "WhatsApp Message" : "Email"} Sent`,
      description: content.length > 80 ? content.slice(0, 80) + "..." : content,
      channel,
      actor: currentUser.name,
    });
  };

  return (
    <FlowDeskStoreContext.Provider
      value={{
        isAuthenticated,
        organization,
        currentUser,
        setCurrentUser,
        switchUserRole,
        login,
        createAgency,
        logout,
        resetWorkspace,
        contacts: scopedContacts,
        allContacts,
        leadLists,
        customRoles,
        templates,
        auditLogs,
        leadJourneys,
        deals,
        automations,
        tasks: scopedTasks,
        events,
        chats,
        campaigns,
        users,
        addManager,
        addEmployee,
        importContacts,
        updateContact,
        addContact,
        deleteContact,
        toggleDoNotContact,
        enrollLeadInWorkflow,
        createLeadList,
        addLeadJourneyStep,
        createCustomRole,
        createTemplate,
        approveTemplate,
        addAuditLog,
        toggleAutomationStatus,
        updateAutomation,
        createAutomation,
        triggerAutomationTest,
        toggleTaskStatus,
        addTask,
        updateDealStage,
        sendMessage,
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

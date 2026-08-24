"use client";

import React, { createContext, useContext, useState } from "react";
import {
  Contact,
  Deal,
  Automation,
  Task,
  EventItem,
  ChatMessage,
  Campaign,
  User,
} from "./types";
import {
  MOCK_CONTACTS,
  MOCK_DEALS,
  MOCK_AUTOMATIONS,
  MOCK_TASKS,
  MOCK_EVENTS,
  MOCK_CHATS,
  MOCK_CAMPAIGNS,
  MOCK_USERS,
  MOCK_TIMELINE,
} from "./mockData";
import { CleanedContactRow } from "./ai/dataCleaner";

interface FlowDeskStoreContextType {
  contacts: Contact[];
  deals: Deal[];
  automations: Automation[];
  tasks: Task[];
  events: EventItem[];
  chats: Record<string, ChatMessage[]>;
  campaigns: Campaign[];
  users: User[];
  timelines: Record<string, any[]>;
  
  // Actions
  importContacts: (rows: CleanedContactRow[], sourceName: string) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  addContact: (contact: Partial<Contact>) => Contact;
  deleteContact: (id: string) => void;
  addTimelineEvent: (contactId: string, event: { type: string; title: string; description?: string; channel?: any }) => void;
  
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

export function FlowDeskStoreProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [automations, setAutomations] = useState<Automation[]>(MOCK_AUTOMATIONS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(MOCK_CHATS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [timelines, setTimelines] = useState<Record<string, any[]>>(MOCK_TIMELINE);

  // Import contacts handler
  const importContacts = (rows: CleanedContactRow[], sourceName: string) => {
    const newContacts: Contact[] = rows.map((row, idx) => {
      // Round robin assignment
      const assignedUser = users[idx % users.length];
      const tags = row.tags.map((t, tIdx) => ({ id: `t-${idx}-${tIdx}`, name: t, color: "#3B82F6" }));
      
      const newId = `imported-${Date.now()}-${idx}`;
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
        leadScore: row.leadScore || 65,
        customFields: row.customFields,
        assignedToId: assignedUser.id,
        assignedTo: assignedUser,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    setContacts((prev) => [...newContacts, ...prev]);

    // Create timeline events for new contacts
    const newTimelines = { ...timelines };
    newContacts.forEach((c) => {
      newTimelines[c.id] = [
        {
          id: `tl-${Date.now()}-${c.id}`,
          type: "IMPORTED",
          title: `Imported from ${sourceName}`,
          description: `Auto-cleaned, normalized phone and assigned to ${c.assignedTo?.name}.`,
          createdAt: "Just now",
          userName: "Smart Importer",
          channel: "SYSTEM",
        },
      ];
    });
    setTimelines(newTimelines);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const addContact = (contactData: Partial<Contact>): Contact => {
    const assigned = users[0];
    const newContact: Contact = {
      id: `cont-${Date.now()}`,
      name: contactData.name || "New Contact",
      email: contactData.email,
      phone: contactData.phone,
      company: contactData.company,
      title: contactData.title,
      source: contactData.source || "MANUAL",
      status: contactData.status || "NEW",
      leadScore: contactData.leadScore || 70,
      tags: contactData.tags || [{ id: "tag-new", name: "Lead", color: "#3B82F6" }],
      assignedTo: assigned,
      assignedToId: assigned.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const addTimelineEvent = (
    contactId: string,
    event: { type: string; title: string; description?: string; channel?: any }
  ) => {
    const newEvent = {
      id: `tl-${Date.now()}`,
      contactId,
      type: event.type,
      title: event.title,
      description: event.description,
      createdAt: "Just now",
      userName: "You",
      channel: event.channel || "SYSTEM",
    };

    setTimelines((prev) => ({
      ...prev,
      [contactId]: [newEvent, ...(prev[contactId] || [])],
    }));
  };

  const toggleAutomationStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const createAutomation = (autoData: Partial<Automation>): Automation => {
    const newAuto: Automation = {
      id: `auto-${Date.now()}`,
      name: autoData.name || "Custom Automation",
      description: autoData.description || "Custom business workflow",
      status: "ACTIVE",
      category: autoData.category || "CUSTOM",
      triggerType: autoData.triggerType || "CONTACT_CREATED",
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      flowDefinition: autoData.flowDefinition || {
        nodes: [
          {
            id: "node-1",
            type: "trigger",
            position: { x: 250, y: 50 },
            data: { label: "New Lead Added", type: "trigger", config: {} },
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
      ? contacts.find((c) => c.id === contactId) || contacts[0]
      : contacts[0];

    const logs: string[] = [
      `[${new Date().toLocaleTimeString()}] Trigger event 'CONTACT_CREATED' received for ${targetContact?.name || "Lead"}`,
      `[${new Date().toLocaleTimeString()}] Evaluated trigger condition: OK`,
      `[${new Date().toLocaleTimeString()}] Lead assigned to ${targetContact?.assignedTo?.name || "Rahul Kumar"} (Round-Robin)`,
      `[${new Date().toLocaleTimeString()}] Official WhatsApp Cloud API: Sent template 'welcome_intro' to ${targetContact?.phone || "+91 9876543210"} (Status: DELIVERED)`,
      `[${new Date().toLocaleTimeString()}] Enqueued Delay Worker: Pausing execution for 24 hours`,
    ];

    // Increment execution count
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, executionCount: a.executionCount + 1, successCount: a.successCount + 1, lastRunAt: "Just now" } : a))
    );

    if (targetContact) {
      addTimelineEvent(targetContact.id, {
        type: "WHATSAPP_SENT",
        title: "Test Automation Run: WhatsApp Delivered",
        description: "Sent welcome message via FlowDesk automation simulator.",
        channel: "WHATSAPP",
      });
    }

    return { success: true, log: logs };
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "COMPLETED" ? "PENDING" : "COMPLETED",
            }
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
      assignedTo: users[1],
      assignedToId: users[1].id,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateDealStage = (id: string, stage: Deal["stage"]) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage } : d))
    );
  };

  const sendMessage = (contactId: string, content: string, channel: "WHATSAPP" | "EMAIL" = "WHATSAPP") => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      contactId,
      channel,
      direction: "OUTBOUND",
      status: "DELIVERED",
      senderName: "You",
      content,
      timestamp: "Just now",
    };

    setChats((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg],
    }));

    addTimelineEvent(contactId, {
      type: channel === "WHATSAPP" ? "WHATSAPP_SENT" : "EMAIL_SENT",
      title: `${channel === "WHATSAPP" ? "WhatsApp Message" : "Email"} Sent`,
      description: content.length > 80 ? content.slice(0, 80) + "..." : content,
      channel,
    });
  };

  return (
    <FlowDeskStoreContext.Provider
      value={{
        contacts,
        deals,
        automations,
        tasks,
        events,
        chats,
        campaigns,
        users,
        timelines,
        importContacts,
        updateContact,
        addContact,
        deleteContact,
        addTimelineEvent,
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

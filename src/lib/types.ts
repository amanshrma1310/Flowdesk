export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "INTERESTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST"
  | "INACTIVE";

export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "SALES" | "MARKETING" | "SUPPORT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  territory?: string;
  activeLeadsCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TimelineEvent {
  id: string;
  contactId: string;
  type: "WHATSAPP_SENT" | "EMAIL_OPENED" | "EMAIL_SENT" | "STATUS_CHANGED" | "TASK_CREATED" | "NOTE" | "IMPORTED" | "FORM_SUBMITTED";
  title: string;
  description?: string;
  createdAt: string;
  userName?: string;
  channel?: "WHATSAPP" | "EMAIL" | "SYSTEM" | "TASK";
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  status: LeadStatus;
  leadScore: number;
  location?: string;
  customFields?: Record<string, string | number | boolean>;
  assignedTo?: User;
  assignedToId?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastContactedAt?: string;
}

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  company: string;
  value: number;
  stage: "DISCOVERY" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  probability: number;
  expectedCloseDate: string;
  assignedToName: string;
}

export type AutomationStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ERROR";

export type NodeType =
  | "trigger"
  | "action_whatsapp"
  | "action_email"
  | "action_sms"
  | "action_task"
  | "action_assign"
  | "action_tag"
  | "condition"
  | "delay";

export interface FlowNodeData {
  label: string;
  type: NodeType;
  description?: string;
  config: Record<string, any>;
  icon?: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  triggerType: string;
  flowDefinition: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastRunAt?: string;
  category: "SALES" | "MARKETING" | "EVENTS" | "ECOMMERCE" | "CUSTOM";
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  contactCompany?: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assignedTo?: User;
  assignedToId?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  type: "WEBINAR" | "WORKSHOP" | "DEMO" | "CONFERENCE";
  eventDate: string;
  durationMins: number;
  locationUrl?: string;
  maxCapacity?: number;
  registeredCount: number;
  confirmedCount: number;
  attendedCount?: number;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  channel: "WHATSAPP" | "EMAIL" | "SMS";
  direction: "INBOUND" | "OUTBOUND";
  status: "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  senderName: string;
  content: string;
  mediaUrl?: string;
  templateName?: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: "WHATSAPP" | "EMAIL";
  segmentName: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "COMPLETED";
  scheduledAt?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  clickedCount: number;
}

export interface SmartImportColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  sampleValue?: string;
}

export interface DataHealthReport {
  totalUploaded: number;
  validContacts: number;
  duplicateCount: number;
  invalidPhoneCount: number;
  missingNameCount: number;
  suggestedFixes: string[];
}

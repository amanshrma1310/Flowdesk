export type UserRole = "MAIN_ADMIN" | "MANAGER" | "EMPLOYEE" | "CUSTOM";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  phone?: string;
  createdAt: string;
  plan?: string;
}

export type PermissionAction =
  | "LEAD_VIEW_ALL"
  | "LEAD_VIEW_TEAM"
  | "LEAD_VIEW_OWN"
  | "LEAD_CREATE"
  | "LEAD_EDIT"
  | "LEAD_DELETE"
  | "LEAD_IMPORT"
  | "LEAD_EXPORT"
  | "LEAD_ASSIGN"
  | "LEAD_REASSIGN"
  | "CAMPAIGN_CREATE"
  | "CAMPAIGN_LAUNCH"
  | "CAMPAIGN_PAUSE"
  | "TEMPLATE_CREATE"
  | "TEMPLATE_APPROVE"
  | "WORKFLOW_CREATE"
  | "WORKFLOW_ACTIVATE"
  | "WORKFLOW_PAUSE"
  | "ANALYTICS_COMPANY"
  | "ANALYTICS_TEAM"
  | "ANALYTICS_OWN"
  | "SETTINGS_MANAGE"
  | "AUDIT_LOG_VIEW";

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: PermissionAction[];
  isSystem?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  customRoleName?: string;
  managerId?: string;
  managerName?: string;
  department?: string;
  territory?: string;
  avatarUrl?: string;
  activeLeadsCount?: number;
  managedEmployeeIds?: string[];
}

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "QUALIFIED"
  | "FOLLOW_UP"
  | "NOT_INTERESTED"
  | "CONVERTED"
  | "LOST"
  | "UNRESPONSIVE"
  | "DO_NOT_CONTACT";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  leadCount: number;
  source: string;
  assignedWorkflowId?: string;
  assignedWorkflowName?: string;
}

export interface LeadJourneyStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  channel?: "WHATSAPP" | "EMAIL" | "SYSTEM" | "TASK" | "AI";
  status: "COMPLETED" | "CURRENT" | "PENDING" | "FAILED";
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  website?: string;
  location?: string;
  source: string;
  status: LeadStatus;
  leadScore: number;
  customFields?: Record<string, string | number | boolean>;
  
  // 3-Point Ownership
  createdById: string;
  createdByName: string;
  ownerId: string;
  ownerName: string;
  managerId: string;
  managerName: string;
  
  leadListId?: string;
  leadListName?: string;
  
  tags: Tag[];
  doNotContact?: boolean;
  activeWorkflowId?: string;
  activeWorkflowName?: string;
  
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  unreadCount?: number;
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
  | "delay"
  | "ai_intent_classifier";

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
  sourceHandle?: string;
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
  createdById?: string;
  createdByName?: string;
  managerId?: string;
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
  assignedToId: string;
  assignedToName: string;
  managerId?: string;
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
  aiIntent?: "INTERESTED" | "NOT_INTERESTED" | "QUESTION" | "COMPLAINT";
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
  repliedCount?: number;
  ownerId?: string;
  ownerName?: string;
  managerId?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: "WHATSAPP" | "EMAIL";
  subject?: string;
  body: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status: "APPROVED" | "PENDING_APPROVAL" | "REJECTED" | "DRAFT";
  isCompanyWide: boolean;
  createdById: string;
  createdByName: string;
  createdAt: string;
  approvedBy?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: "LEAD" | "CAMPAIGN" | "WORKFLOW" | "USER" | "TEMPLATE" | "SETTINGS" | "INTEGRATION" | "ORGANIZATION";
  entityName: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
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

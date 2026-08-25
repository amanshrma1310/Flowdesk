export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface Organization {
  id: string;
  name: string;
  joinCode: string;
  createdAt: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
}

export interface UserPermissions {
  manageUsers: boolean;
  manageEmployees: boolean;
  viewAllLeads: boolean;
  viewTeamLeads: boolean;
  addLeads: boolean;
  importLeads: boolean;
  emailMarketing: boolean;
  whatsAppMarketing: boolean;
  createTemplates: boolean;
  createWorkflows: boolean;
  viewReports: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
  managerId?: string; // If employee, assigned manager
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  permissions?: Partial<UserPermissions>;
}

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Follow-up"
  | "Interested"
  | "Not Interested"
  | "Positive"
  | "Negative"
  | "Converted"
  | "Unresponsive"
  | "Unsubscribed"
  | "Blocked";

export interface LeadActivity {
  id: string;
  timestamp: string;
  action: string;
  channel?: "Email" | "WhatsApp" | "System" | "Workflow";
  details?: string;
  actor: string;
}

export interface Lead {
  id: string;
  agencyId: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsApp?: string;
  website?: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  customData?: Record<string, string>;
  tags: string[];
  folderId?: string;
  folderName?: string;
  createdById: string;
  createdByName: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  managerId?: string;
  managerName?: string;
  activeWorkflowId?: string;
  activeWorkflowName?: string;
  createdAt: string;
  updatedAt: string;
  activities: LeadActivity[];
}

export interface LeadFolder {
  id: string;
  agencyId: string;
  name: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  leadCount: number;
  newCount: number;
  contactedCount: number;
  interestedCount: number;
  notInterestedCount: number;
  convertedCount: number;
}

export type TemplateChannel = "Email" | "WhatsApp";

export interface MarketingTemplate {
  id: string;
  agencyId: string;
  name: string;
  channel: TemplateChannel;
  subject?: string; // For Email
  body: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export type CampaignStatus = "Draft" | "Scheduled" | "Running" | "Paused" | "Completed" | "Failed";

export interface Campaign {
  id: string;
  agencyId: string;
  name: string;
  folderId: string;
  folderName: string;
  channel: TemplateChannel;
  templateId: string;
  templateName: string;
  status: CampaignStatus;
  scheduledAt?: string;
  createdById: string;
  createdByName: string;
  totalLeads: number;
  sentCount: number;
  deliveredCount: number;
  openedCount?: number; // Email
  repliedCount: number;
  positiveResponses: number;
  negativeResponses: number;
  failedCount: number;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  dayDelay: number;
  channel: TemplateChannel;
  templateId: string;
  templateName: string;
  actionTitle: string;
}

export interface Workflow {
  id: string;
  agencyId: string;
  name: string;
  description?: string;
  trigger: "Lead Added" | "Added to List" | "Manual Enrollment";
  steps: WorkflowStep[];
  onPositiveResponse: "Status = Interested & Stop automated messages & Notify Employee" | "Custom";
  onNegativeResponse: "Status = Not Interested & Stop Campaign" | "Custom";
  onNoResponse: "Send Next Follow-up" | "Stop Workflow";
  isActive: boolean;
  createdById: string;
  createdByName: string;
  enrolledLeadsCount: number;
  createdAt: string;
}

export type FieldInputType = "text" | "email" | "tel" | "number" | "textarea" | "select";

export interface LeadFormField {
  id: string;
  label: string;
  name: string;
  type: FieldInputType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select dropdown options
}

export interface LeadForm {
  id: string;
  agencyId: string;
  title: string;
  description?: string;
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string; // Welcome / Thank You Page URL
  folderId?: string;
  folderName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  workflowId?: string;
  workflowName?: string;
  fields: LeadFormField[];
  submissionCount: number;
  isActive: boolean;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface SMTPSettings {
  host: string;
  port: string;
  username: string;
  password?: string;
  encryption: "TLS" | "SSL" | "NONE";
  fromName: string;
  fromEmail: string;
  isConfigured: boolean;
}

export interface WhatsAppAPISettings {
  provider: "Meta WhatsApp Cloud API" | "Twilio" | "Custom Provider";
  apiUrl: string;
  apiKey: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string;
  isConfigured: boolean;
}

export interface LeadResponse {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  campaignId?: string;
  campaignName?: string;
  channel: "WhatsApp" | "Email";
  message: string;
  sentiment: "Positive" | "Negative" | "Question";
  timestamp: string;
  handled: boolean;
}

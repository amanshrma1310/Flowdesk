export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface Organization {
  id: string;
  name: string;
  joinCode: string; // Used as Agency ID for login
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
  password?: string;
  temporaryPassword?: string;
  isFirstLogin?: boolean;
  phone?: string;
  avatar?: string;
  role: UserRole; // IMMUTABLE by employee/manager - locked by Admin
  agencyId: string;
  agencyJoinCode?: string; // Agency ID
  managerId?: string; // If employee, assigned manager
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  permissions?: Partial<UserPermissions>;
}

export interface SentEmailLog {
  id: string;
  toEmail: string;
  toName: string;
  subject: string;
  body: string;
  agencyId: string;
  temporaryPassword?: string;
  sentAt: string;
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

export type WorkflowActionType =
  | "SEND_EMAIL"
  | "SEND_WHATSAPP"
  | "SEND_SMS"
  | "WAIT_DELAY"
  | "IF_ELSE"
  | "UPDATE_STATUS"
  | "ADD_TAG"
  | "REMOVE_TAG"
  | "ASSIGN_USER"
  | "MOVE_FOLDER"
  | "CREATE_TASK"
  | "INTERNAL_NOTIFY"
  | "WEBHOOK";

export type WorkflowTriggerType =
  | "FORM_SUBMITTED"
  | "LEAD_CREATED"
  | "TAG_ADDED"
  | "STATUS_CHANGED"
  | "WHATSAPP_RECEIVED"
  | "MANUAL_ENROLLMENT";

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  actionType?: WorkflowActionType;
  actionTitle: string;
  description?: string;

  // Communication & Sender
  channel?: TemplateChannel | "SMS";
  sendAsAccount?: "SMTP_DEFAULT" | "LOGGED_IN_USER" | "ASSIGNED_USER" | "CUSTOM";
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  whatsappSenderNumberId?: string;
  templateId?: string;
  templateName?: string;
  customSubject?: string;
  customMessage?: string;

  // Timing / Delays
  dayDelay: number;
  delayValue?: number;
  delayUnit?: "minutes" | "hours" | "days";

  // CRM / Contact operations
  leadStatus?: LeadStatus;
  tag?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  folderId?: string;
  folderName?: string;
  taskTitle?: string;
  notificationMessage?: string;

  // Logic & Conditions
  conditionField?: "status" | "tag" | "channel" | "replied" | "score";
  conditionOperator?: "equals" | "contains" | "is_true" | "is_false";
  conditionValue?: string;
  yesSteps?: WorkflowStep[];
  noSteps?: WorkflowStep[];

  // Webhook
  webhookUrl?: string;
}

export interface Workflow {
  id: string;
  agencyId: string;
  name: string;
  description?: string;
  trigger: string;
  triggerType?: WorkflowTriggerType;
  triggerConfig?: {
    formId?: string;
    formName?: string;
    tag?: string;
    status?: string;
    folderId?: string;
  };
  steps: WorkflowStep[];
  onPositiveResponse?: string;
  onNegativeResponse?: string;
  onNoResponse?: string;
  isActive: boolean;
  allowReEntry?: boolean;
  stopOnResponse?: boolean;
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

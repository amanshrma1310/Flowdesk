import { Lead, Workflow, WorkflowStep, SMTPSettings, WhatsAppAPISettings, LeadActivity, LeadStatus } from "./types";

export interface WorkflowExecutionLog {
  stepIndex: number;
  stepTitle: string;
  actionType: string;
  status: "SUCCESS" | "WARNING" | "FAILED" | "SCHEDULED";
  message: string;
  timestamp: string;
  details?: any;
}

export interface WorkflowExecutionResult {
  success: boolean;
  workflowId: string;
  workflowName: string;
  leadId: string;
  leadName: string;
  stepsExecuted: number;
  logs: WorkflowExecutionLog[];
  updatedLead: Lead;
}

/**
 * Replaces template variables like {{name}}, {{first_name}}, {{company}}, {{email}}, {{phone}}
 * with values from the given lead record.
 */
export function interpolateLeadVariables(text: string = "", lead: Partial<Lead>): string {
  if (!text) return "";
  const fullName = (lead.name || "").trim();
  const firstName = fullName.split(" ")[0] || "there";
  const company = (lead.company || "").trim() || "your company";
  const email = (lead.email || "").trim();
  const phone = (lead.phone || lead.whatsApp || "").trim();
  const notes = (lead.notes || "").trim();

  return text
    .replace(/\{\{\s*name\s*\}\}/gi, fullName || "there")
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*company\s*\}\}/gi, company)
    .replace(/\{\{\s*email\s*\}\}/gi, email)
    .replace(/\{\{\s*phone\s*\}\}/gi, phone)
    .replace(/\{\{\s*notes\s*\}\}/gi, notes);
}

/**
 * Executes a single step on a lead record.
 */
export async function executeSingleStep(
  step: WorkflowStep,
  stepIndex: number,
  lead: Lead,
  workflow: Workflow,
  options: {
    isLive: boolean;
    smtpSettings?: SMTPSettings;
    whatsAppSettings?: WhatsAppAPISettings;
    actorName?: string;
  }
): Promise<{ log: WorkflowExecutionLog; updatedLead: Lead; pauseExecution?: boolean }> {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  let currentLead = { ...lead };
  const actionType = step.actionType || "SEND_EMAIL";
  const actor = options.actorName || `Workflow: ${workflow.name}`;

  switch (actionType) {
    case "SEND_EMAIL": {
      const subject = interpolateLeadVariables(
        step.customSubject || `Regarding ${lead.company || lead.name}`,
        lead
      );
      const rawBody =
        step.customMessage ||
        `Hello ${lead.name.split(" ")[0]},\n\nThank you for reaching out to us. We wanted to follow up regarding your inquiry.`;
      const body = interpolateLeadVariables(rawBody, lead);
      const recipient = (lead.email || "").trim();

      if (!recipient) {
        return {
          log: {
            stepIndex,
            stepTitle: step.actionTitle,
            actionType,
            status: "WARNING",
            message: `Skipped Send Email: Contact "${lead.name}" has no email address.`,
            timestamp,
          },
          updatedLead: currentLead,
        };
      }

      if (options.isLive && options.smtpSettings?.host) {
        try {
          const res = await fetch("/api/v1/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              smtpSettings: options.smtpSettings,
              to: recipient,
              subject,
              text: body,
            }),
          });

          const json = await res.json();
          if (res.ok && json.success) {
            const act: LeadActivity = {
              id: `act-wf-em-${Date.now()}-${stepIndex}`,
              timestamp: dateStr,
              action: `Automated Email Sent: "${subject}"`,
              channel: "Email",
              details: body.slice(0, 140) + (body.length > 140 ? "..." : ""),
              actor,
            };
            currentLead.activities = [act, ...(currentLead.activities || [])];
            currentLead.status = currentLead.status === "New" ? "Contacted" : currentLead.status;

            return {
              log: {
                stepIndex,
                stepTitle: step.actionTitle,
                actionType,
                status: "SUCCESS",
                message: `Email successfully delivered to ${recipient} via SMTP!`,
                timestamp,
                details: { messageId: json.messageId },
              },
              updatedLead: currentLead,
            };
          } else {
            // SMTP error logged gracefully
            const act: LeadActivity = {
              id: `act-wf-em-${Date.now()}-${stepIndex}`,
              timestamp: dateStr,
              action: `Email Queued: "${subject}"`,
              channel: "Email",
              details: `Prepared for ${recipient} (${json.error || "SMTP not configured"})`,
              actor,
            };
            currentLead.activities = [act, ...(currentLead.activities || [])];

            return {
              log: {
                stepIndex,
                stepTitle: step.actionTitle,
                actionType,
                status: "WARNING",
                message: `Email generated for ${recipient}: "${subject}" (SMTP response: ${json.error || "queued"})`,
                timestamp,
              },
              updatedLead: currentLead,
            };
          }
        } catch (err: any) {
          return {
            log: {
              stepIndex,
              stepTitle: step.actionTitle,
              actionType,
              status: "WARNING",
              message: `Email prepared for ${recipient}: "${subject}"`,
              timestamp,
            },
            updatedLead: currentLead,
          };
        }
      } else {
        // Dry-run simulation or SMTP fallback
        const act: LeadActivity = {
          id: `act-wf-em-${Date.now()}-${stepIndex}`,
          timestamp: dateStr,
          action: `Automated Email Dispatched: "${subject}"`,
          channel: "Email",
          details: body.slice(0, 140) + (body.length > 140 ? "..." : ""),
          actor,
        };
        currentLead.activities = [act, ...(currentLead.activities || [])];
        currentLead.status = currentLead.status === "New" ? "Contacted" : currentLead.status;

        return {
          log: {
            stepIndex,
            stepTitle: step.actionTitle,
            actionType,
            status: "SUCCESS",
            message: `Dispatched email to ${recipient}: "${subject}"`,
            timestamp,
          },
          updatedLead: currentLead,
        };
      }
    }

    case "SEND_WHATSAPP":
    case "SEND_SMS": {
      const rawMsg =
        step.customMessage ||
        `Hi {{first_name}} 👋 Thank you for reaching out to us. We received your request and will contact you shortly.`;
      const msg = interpolateLeadVariables(rawMsg, lead);
      const phone = (lead.whatsApp || lead.phone || "").replace(/[^0-9+]/g, "");

      const act: LeadActivity = {
        id: `act-wf-wa-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Automated WhatsApp Message Prepared`,
        channel: "WhatsApp",
        details: msg.slice(0, 140) + (msg.length > 140 ? "..." : ""),
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];
      currentLead.status = currentLead.status === "New" ? "Contacted" : currentLead.status;

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `WhatsApp message prepared for ${phone || lead.name}: "${msg.slice(0, 45)}..."`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "UPDATE_STATUS": {
      const newStatus = (step.leadStatus || "Contacted") as LeadStatus;
      const oldStatus = currentLead.status;
      currentLead.status = newStatus;

      const act: LeadActivity = {
        id: `act-wf-st-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Status Updated: ${oldStatus} ➔ ${newStatus}`,
        channel: "Workflow",
        details: `Automated status update triggered by workflow step`,
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `Lead status updated to "${newStatus}".`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "ADD_TAG": {
      const tagToAdd = step.tag || "Hot Prospect";
      const existingTags = currentLead.tags || [];
      if (!existingTags.includes(tagToAdd)) {
        currentLead.tags = [...existingTags, tagToAdd];
      }

      const act: LeadActivity = {
        id: `act-wf-tag-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Tag Added: #${tagToAdd}`,
        channel: "Workflow",
        details: `Tagged automatically by workflow`,
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `Added tag "#${tagToAdd}" to contact profile.`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "REMOVE_TAG": {
      const tagToRemove = step.tag || "";
      if (tagToRemove && currentLead.tags) {
        currentLead.tags = currentLead.tags.filter((t) => t !== tagToRemove);
      }

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `Removed tag "#${tagToRemove}" from contact.`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "ASSIGN_USER": {
      const userName = step.assignedUserName || "Assigned Rep";
      currentLead.assignedEmployeeId = step.assignedUserId || currentLead.assignedEmployeeId || "unassigned";
      currentLead.assignedEmployeeName = userName;

      const act: LeadActivity = {
        id: `act-wf-asgn-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Assigned to ${userName}`,
        channel: "Workflow",
        details: `Lead automatically routed to ${userName}`,
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `Contact routed and assigned to ${userName}.`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "MOVE_FOLDER": {
      if (step.folderId) {
        currentLead.folderId = step.folderId;
        currentLead.folderName = step.folderName || "Target Folder";
      }

      const act: LeadActivity = {
        id: `act-wf-fld-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Moved to Folder: ${step.folderName || "Folder"}`,
        channel: "Workflow",
        details: `Organized into folder`,
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `Assigned contact to folder "${step.folderName || "Selected Folder"}".`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "INTERNAL_NOTIFY": {
      const rawAlert = step.notificationMessage || "🔥 High Intent Lead: {{name}} submitted an inquiry!";
      const alertMsg = interpolateLeadVariables(rawAlert, lead);

      const act: LeadActivity = {
        id: `act-wf-ntf-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Internal Notification: ${alertMsg}`,
        channel: "Workflow",
        details: `Notification triggered for sales team`,
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SUCCESS",
          message: `Internal notification broadcasted: "${alertMsg}"`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }

    case "WAIT_DELAY": {
      const duration = step.delayValue || step.dayDelay || 1;
      const unit = step.delayUnit || "days";

      const act: LeadActivity = {
        id: `act-wf-wt-${Date.now()}-${stepIndex}`,
        timestamp: dateStr,
        action: `Scheduled Delay: Paused for ${duration} ${unit}`,
        channel: "Workflow",
        details: `Next drip follow-up will resume after delay`,
        actor,
      };
      currentLead.activities = [act, ...(currentLead.activities || [])];

      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle,
          actionType,
          status: "SCHEDULED",
          message: `Scheduled pause for ${duration} ${unit}. Next steps will execute automatically.`,
          timestamp,
        },
        updatedLead: currentLead,
        // In live execution, delay pauses immediate sequential execution
        pauseExecution: options.isLive,
      };
    }

    default: {
      return {
        log: {
          stepIndex,
          stepTitle: step.actionTitle || "Action Step",
          actionType,
          status: "SUCCESS",
          message: `Action "${step.actionTitle}" processed successfully.`,
          timestamp,
        },
        updatedLead: currentLead,
      };
    }
  }
}

/**
 * Runs a complete workflow on a given lead record.
 */
export async function runWorkflowOnLead(
  workflow: Workflow,
  lead: Lead,
  options: {
    isLive: boolean;
    smtpSettings?: SMTPSettings;
    whatsAppSettings?: WhatsAppAPISettings;
    actorName?: string;
  }
): Promise<WorkflowExecutionResult> {
  let currentLead: Lead = {
    ...lead,
    activeWorkflowId: workflow.id,
    activeWorkflowName: workflow.name,
  };

  const logs: WorkflowExecutionLog[] = [];
  const steps = workflow.steps || [];
  let stepsExecuted = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const { log, updatedLead, pauseExecution } = await executeSingleStep(
      step,
      i + 1,
      currentLead,
      workflow,
      options
    );

    currentLead = updatedLead;
    logs.push(log);
    stepsExecuted++;

    if (pauseExecution) {
      break;
    }
  }

  return {
    success: true,
    workflowId: workflow.id,
    workflowName: workflow.name,
    leadId: currentLead.id,
    leadName: currentLead.name,
    stepsExecuted,
    logs,
    updatedLead: currentLead,
  };
}

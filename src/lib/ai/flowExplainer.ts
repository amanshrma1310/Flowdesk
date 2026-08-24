import { Automation, FlowNode, FlowEdge } from "@/lib/types";

export function explainAutomationFlow(nodes: FlowNode[], edges: FlowEdge[]): string {
  if (!nodes || nodes.length === 0) {
    return "This automation does not contain any steps yet.";
  }

  const triggerNode = nodes.find((n) => n.type === "trigger" || n.data.type === "trigger");
  let explanation = "";

  if (triggerNode) {
    const triggerLabel = triggerNode.data.label || "A specific event occurs";
    explanation += `**When:** ${triggerLabel}\n\n`;
  } else {
    explanation += `**When:** A workflow trigger event is detected\n\n`;
  }

  // Find sequence
  explanation += `**The system executes the following steps in sequence:**\n`;

  const nonTriggers = nodes.filter((n) => n.type !== "trigger" && n.data.type !== "trigger");
  
  if (nonTriggers.length === 0) {
    explanation += `• Awaits user to connect action blocks (WhatsApp, Email, Delays, Tasks).\n`;
    return explanation;
  }

  let stepIdx = 1;
  for (const node of nonTriggers) {
    const d = node.data;
    const nodeType = d.type || node.type;

    switch (nodeType) {
      case "action_whatsapp":
        explanation += `${stepIdx}. **WhatsApp Message:** Automatically sends a personalized WhatsApp message (Template: \`${d.config?.templateName || "welcome_intro"}\`) with customer dynamic variables.\n`;
        break;
      case "action_email":
        explanation += `${stepIdx}. **Email Dispatch:** Sends an automated email (\`${d.config?.subject || "Welcome to FlowDesk"}\`) and tracks open/click engagement.\n`;
        break;
      case "action_task":
        explanation += `${stepIdx}. **Task Assignment:** Automatically creates a task (\`${d.config?.title || "Follow-up with customer"}\`) assigned to the active sales representative.\n`;
      case "action_assign":
        explanation += `${stepIdx}. **Lead Distribution:** Routes the lead using **${d.config?.method || "Round-Robin"}** distribution across the sales team.\n`;
        break;
      case "condition":
        explanation += `${stepIdx}. **Decision Branch:** Checks condition \`${d.config?.field || "leadScore"} ${d.config?.operator || ">"} ${d.config?.value || "70"}\`. If YES, executes priority track; if NO, falls back to standard follow-up.\n`;
        break;
      case "delay":
        explanation += `${stepIdx}. **Smart Delay:** Pauses the workflow for **${d.config?.duration || "1"} ${d.config?.unit || "days"}** before proceeding.\n`;
        break;
      case "action_tag":
        explanation += `${stepIdx}. **Tag Management:** Adds tag \`${d.config?.tagName || "Hot Lead"}\` to the customer's 360 profile.\n`;
        break;
      default:
        explanation += `${stepIdx}. **${d.label}:** Executes action with configured parameters.\n`;
        break;
    }
    stepIdx++;
  }

  explanation += `\n*If the customer replies on WhatsApp or email at any point, the automated sequence can pause and instantly alert the assigned salesperson.*`;

  return explanation;
}

"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Plus,
  Mail,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings as SettingsIcon,
  Play,
  Save,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  GitBranch,
  UserCheck,
  Tag,
  FolderKanban,
  CheckSquare,
  Bell,
  Globe,
  Sliders,
  Sparkles,
  History,
  X,
  Search,
  RotateCcw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";
import {
  Workflow,
  WorkflowStep,
  WorkflowActionType,
  WorkflowTriggerType,
  TemplateChannel,
  LeadStatus,
} from "@/lib/types";
import { WORKFLOW_RECIPES } from "@/lib/workflowTemplates";

const ALL_STATUS_OPTIONS: LeadStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Interested",
  "Not Interested",
  "Positive",
  "Negative",
  "Converted",
  "Unresponsive",
  "Unsubscribed",
  "Blocked",
];

export default function WorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const workflowId = resolvedParams.id;
  const router = useRouter();

  const {
    workflows,
    templates,
    folders,
    forms,
    users,
    scopedLeads,
    createWorkflow,
    updateWorkflow,
    toggleWorkflowActive,
    currentUser,
  } = useFlowDesk();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"BUILDER" | "SETTINGS" | "ENROLLMENTS">("BUILDER");

  // Workflow State
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [trigger, setTrigger] = useState("Web Form Submitted");
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>("FORM_SUBMITTED");
  const [triggerConfig, setTriggerConfig] = useState<any>({});
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [allowReEntry, setAllowReEntry] = useState(false);
  const [stopOnResponse, setStopOnResponse] = useState(true);

  // Drawer & Modal States
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [insertBranch, setInsertBranch] = useState<"main" | "yes" | "no">("main");
  const [parentBranchStepId, setParentBranchStepId] = useState<string | null>(null);
  const [actionSearchQuery, setActionSearchQuery] = useState("");
  const [selectedActionCategory, setSelectedActionCategory] = useState<string>("ALL");

  // Trigger Edit Drawer
  const [isTriggerDrawerOpen, setIsTriggerDrawerOpen] = useState(false);

  // Test Simulation Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testLeadId, setTestLeadId] = useState<string>("");
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Save Toast
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  useEffect(() => {
    const found = workflows.find((w) => w.id === workflowId);
    if (found) {
      setCurrentWorkflow(found);
      setWorkflowName(found.name);
      setDescription(found.description || "");
      setIsActive(found.isActive);
      setTrigger(found.trigger || "Web Form Submitted");
      setTriggerType(found.triggerType || "FORM_SUBMITTED");
      setTriggerConfig(found.triggerConfig || {});
      setSteps(found.steps || []);
      setAllowReEntry(found.allowReEntry || false);
      setStopOnResponse(found.stopOnResponse ?? true);
    } else if (workflowId === "new") {
      // New workflow starter
      const starter = WORKFLOW_RECIPES[0];
      setWorkflowName("New Marketing Automation Workflow");
      setDescription("Automated lead follow-up and multi-channel outreach sequence");
      setIsActive(true);
      setTrigger(starter.trigger);
      setTriggerType(starter.triggerType);
      setSteps(starter.steps);
    }
  }, [workflowId, workflows]);

  // Save Workflow
  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      alert("Please provide a workflow name.");
      return;
    }

    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        name: workflowName.trim(),
        description: description.trim(),
        isActive,
        trigger,
        triggerType,
        triggerConfig,
        steps,
        allowReEntry,
        stopOnResponse,
      });
      setSaveAlert("Workflow saved successfully!");
      setTimeout(() => setSaveAlert(null), 2500);
    } else if (workflowId === "new") {
      const created = createWorkflow({
        name: workflowName.trim(),
        description: description.trim(),
        trigger,
        triggerType,
        triggerConfig,
        steps,
        onPositiveResponse: "Status = Interested & Stop automated messages & Notify Employee",
        onNegativeResponse: "Status = Not Interested & Stop Campaign",
        onNoResponse: "Send Next Follow-up",
        isActive,
        allowReEntry,
        stopOnResponse,
      });
      router.replace(`/automations/${created.id}`);
    }
  };

  // Open Add Action Modal at specific index
  const handleOpenAddAction = (index: number, branch: "main" | "yes" | "no" = "main", parentStepId: string | null = null) => {
    setInsertAtIndex(index);
    setInsertBranch(branch);
    setParentBranchStepId(parentStepId);
    setActionSearchQuery("");
    setSelectedActionCategory("ALL");
    setIsAddActionModalOpen(true);
  };

  // Insert Action from Modal
  const handleSelectActionType = (actionType: WorkflowActionType) => {
    setIsAddActionModalOpen(false);
    const newStepId = `step-${Date.now()}`;

    let defaultTitle = "Action Step";
    let channel: TemplateChannel | "SMS" | undefined = undefined;
    let templateId: string | undefined = undefined;
    let templateName: string | undefined = undefined;
    let customSubject = "";
    let customMessage = "";
    let delayValue = 1;
    let delayUnit: "minutes" | "hours" | "days" = "days";
    let leadStatus: LeadStatus | undefined = undefined;
    let tag = "";
    let conditionField: any = "replied";
    let conditionOperator: any = "is_true";

    switch (actionType) {
      case "SEND_WHATSAPP":
        defaultTitle = "Send WhatsApp Message";
        channel = "WhatsApp";
        const waTpl = templates.find((t) => t.channel === "WhatsApp") || templates[0];
        templateId = waTpl?.id;
        templateName = waTpl?.name || "WhatsApp Template";
        customMessage = "Hi {{name}}! Thank you for reaching out. How can we help you today?";
        break;
      case "SEND_EMAIL":
        defaultTitle = "Send Outreach Email";
        channel = "Email";
        const emTpl = templates.find((t) => t.channel === "Email") || templates[0];
        templateId = emTpl?.id;
        templateName = emTpl?.name || "Email Template";
        customSubject = "Regarding your consultation request";
        customMessage = "Hi {{name}},\n\nThank you for reaching out to us. We have received your details.";
        break;
      case "SEND_SMS":
        defaultTitle = "Send SMS Text";
        channel = "SMS";
        customMessage = "Hi {{name}}, your request has been confirmed. Team FlowDesk.";
        break;
      case "WAIT_DELAY":
        defaultTitle = "Wait / Delay";
        delayValue = 1;
        delayUnit = "days";
        break;
      case "IF_ELSE":
        defaultTitle = "If / Else Condition";
        conditionField = "replied";
        conditionOperator = "is_true";
        break;
      case "UPDATE_STATUS":
        defaultTitle = "Update Lead Status";
        leadStatus = "Contacted";
        break;
      case "ADD_TAG":
        defaultTitle = "Add Tag to Lead";
        tag = "Warm Lead";
        break;
      case "REMOVE_TAG":
        defaultTitle = "Remove Tag";
        tag = "Cold";
        break;
      case "ASSIGN_USER":
        defaultTitle = "Assign to Team Member";
        break;
      case "MOVE_FOLDER":
        defaultTitle = "Move to Pipeline Folder";
        break;
      case "CREATE_TASK":
        defaultTitle = "Create Task for Rep";
        break;
      case "INTERNAL_NOTIFY":
        defaultTitle = "Send Internal Notification";
        break;
      case "WEBHOOK":
        defaultTitle = "Trigger Outbound Webhook";
        break;
    }

    const newStep: WorkflowStep = {
      id: newStepId,
      stepNumber: (insertAtIndex ?? steps.length) + 1,
      actionType,
      actionTitle: defaultTitle,
      channel,
      templateId,
      templateName,
      customSubject,
      customMessage,
      dayDelay: delayUnit === "days" ? delayValue : 0,
      delayValue,
      delayUnit,
      leadStatus,
      tag,
      conditionField,
      conditionOperator,
      yesSteps: actionType === "IF_ELSE" ? [] : undefined,
      noSteps: actionType === "IF_ELSE" ? [] : undefined,
    };

    if (insertBranch === "main") {
      const updated = [...steps];
      const idx = insertAtIndex ?? updated.length;
      updated.splice(idx, 0, newStep);
      const renumbered = updated.map((s, i) => ({ ...s, stepNumber: i + 1 }));
      setSteps(renumbered);
    } else if (parentBranchStepId) {
      const updated = steps.map((s) => {
        if (s.id === parentBranchStepId) {
          if (insertBranch === "yes") {
            const currentYes = s.yesSteps || [];
            return { ...s, yesSteps: [...currentYes, newStep] };
          } else {
            const currentNo = s.noSteps || [];
            return { ...s, noSteps: [...currentNo, newStep] };
          }
        }
        return s;
      });
      setSteps(updated);
    }

    // Open configuration drawer for this newly created step
    setSelectedStep(newStep);
    setIsDrawerOpen(true);
  };

  // Delete Step
  const handleDeleteStep = (stepId: string) => {
    // Check main branch
    const filtered = steps.filter((s) => s.id !== stepId);
    if (filtered.length !== steps.length) {
      setSteps(filtered.map((s, i) => ({ ...s, stepNumber: i + 1 })));
      if (selectedStep?.id === stepId) {
        setIsDrawerOpen(false);
        setSelectedStep(null);
      }
      return;
    }

    // Check nested branches
    const updated = steps.map((s) => {
      if (s.actionType === "IF_ELSE") {
        return {
          ...s,
          yesSteps: (s.yesSteps || []).filter((ys) => ys.id !== stepId),
          noSteps: (s.noSteps || []).filter((ns) => ns.id !== stepId),
        };
      }
      return s;
    });
    setSteps(updated);
    if (selectedStep?.id === stepId) {
      setIsDrawerOpen(false);
      setSelectedStep(null);
    }
  };

  // Update Step in Drawer
  const handleUpdateSelectedStep = (changes: Partial<WorkflowStep>) => {
    if (!selectedStep) return;
    const updatedStep = { ...selectedStep, ...changes };
    setSelectedStep(updatedStep);

    // Update in main steps
    const inMain = steps.some((s) => s.id === updatedStep.id);
    if (inMain) {
      setSteps(steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)));
      return;
    }

    // Update in nested branches
    const inNested = steps.map((s) => {
      if (s.actionType === "IF_ELSE") {
        return {
          ...s,
          yesSteps: (s.yesSteps || []).map((ys) => (ys.id === updatedStep.id ? updatedStep : ys)),
          noSteps: (s.noSteps || []).map((ns) => (ns.id === updatedStep.id ? updatedStep : ns)),
        };
      }
      return s;
    });
    setSteps(inNested);
  };

  // Reorder Steps (Move Up / Down)
  const handleMoveStep = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  // Duplicate Step
  const handleDuplicateStep = (step: WorkflowStep, index: number) => {
    const clone: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
      actionTitle: `${step.actionTitle} (Copy)`,
    };
    const updated = [...steps];
    updated.splice(index + 1, 0, clone);
    setSteps(updated.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  // Simulate Workflow Test
  const handleRunTest = () => {
    setIsSimulating(true);
    setTestLogs([`🚀 Starting Workflow Simulation: "${workflowName}"`]);

    const targetLead = scopedLeads.find((l) => l.id === testLeadId) || scopedLeads[0] || {
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 98765 43210",
      company: "Acme Corp",
    };

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        `📥 Trigger Activated: [${trigger}] with lead ${targetLead.name} (${targetLead.phone || targetLead.email})`,
      ]);
    }, 400);

    steps.forEach((step, idx) => {
      setTimeout(() => {
        let actionDesc = "";
        switch (step.actionType) {
          case "SEND_WHATSAPP":
            actionDesc = `💬 Executed WhatsApp Outreach: "${step.customMessage?.slice(0, 35) || step.templateName}..." ➔ Delivered!`;
            break;
          case "SEND_EMAIL":
            actionDesc = `✉️ Sent Email: "${step.customSubject || step.templateName}" to ${targetLead.email}`;
            break;
          case "WAIT_DELAY":
            actionDesc = `⏳ Delay Scheduled: Paused for ${step.delayValue || step.dayDelay} ${step.delayUnit || "days"}`;
            break;
          case "UPDATE_STATUS":
            actionDesc = `📊 Status Updated: Changed lead status to "${step.leadStatus || "Contacted"}"`;
            break;
          case "ADD_TAG":
            actionDesc = `🏷️ Tag Applied: Added "${step.tag || "Hot Prospect"}" to contact profile`;
            break;
          case "ASSIGN_USER":
            actionDesc = `👤 Lead Assigned: Routed lead to sales executive`;
            break;
          case "IF_ELSE":
            actionDesc = `🔀 Evaluated Condition: [${step.conditionField} ${step.conditionOperator}] ➔ Evaluated successfully`;
            break;
          default:
            actionDesc = `⚡ Action Completed: ${step.actionTitle}`;
        }
        setTestLogs((prev) => [...prev, `[Step ${idx + 1}] ${actionDesc}`]);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setTestLogs((prev) => [...prev, `🎉 Workflow Simulation Completed with 0 Errors!`]);
            setIsSimulating(false);
          }, 400);
        }
      }, 700 * (idx + 1));
    });
  };

  // Helper Icon & Color Getter for Nodes
  const getActionTheme = (type?: WorkflowActionType) => {
    switch (type) {
      case "SEND_WHATSAPP":
        return { icon: Send, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-300 dark:border-emerald-800", badge: "WhatsApp" };
      case "SEND_EMAIL":
        return { icon: Mail, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/50", border: "border-sky-300 dark:border-sky-800", badge: "Email" };
      case "SEND_SMS":
        return { icon: MessageSquare, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/50", border: "border-teal-300 dark:border-teal-800", badge: "SMS" };
      case "WAIT_DELAY":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/50", border: "border-amber-300 dark:border-amber-800", badge: "Delay" };
      case "IF_ELSE":
        return { icon: GitBranch, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/50", border: "border-purple-300 dark:border-purple-800", badge: "If / Else" };
      case "UPDATE_STATUS":
        return { icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/50", border: "border-indigo-300 dark:border-indigo-800", badge: "Status" };
      case "ADD_TAG":
      case "REMOVE_TAG":
        return { icon: Tag, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/50", border: "border-violet-300 dark:border-violet-800", badge: "Tag" };
      case "ASSIGN_USER":
        return { icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50", border: "border-blue-300 dark:border-blue-800", badge: "Assign" };
      case "MOVE_FOLDER":
        return { icon: FolderKanban, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/50", border: "border-cyan-300 dark:border-cyan-800", badge: "Folder" };
      case "CREATE_TASK":
        return { icon: CheckSquare, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/50", border: "border-rose-300 dark:border-rose-800", badge: "Task" };
      case "INTERNAL_NOTIFY":
        return { icon: Bell, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/50", border: "border-orange-300 dark:border-orange-800", badge: "Alert" };
      case "WEBHOOK":
        return { icon: Globe, color: "text-fuchsia-600", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/50", border: "border-fuchsia-300 dark:border-fuchsia-800", badge: "Webhook" };
      default:
        return { icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/50", border: "border-indigo-300 dark:border-indigo-800", badge: "Action" };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 -m-4 md:-m-6 overflow-hidden">
      {/* 1. TOP HEADER BAR (GoHighLevel Style) */}
      <div className="h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10 shadow-xs">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link href="/automations">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name..."
              className="text-sm md:text-base font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5"
            />
            <p className="text-[11px] text-slate-400 px-1.5 hidden sm:block">
              {steps.length} {steps.length === 1 ? "Action" : "Actions"} • Trigger: {trigger}
            </p>
          </div>
        </div>

        {/* Center: Tabs Switcher */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("BUILDER")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "BUILDER" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold" : "text-slate-500"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Builder</span>
          </button>
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "SETTINGS" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold" : "text-slate-500"
            }`}
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab("ENROLLMENTS")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "ENROLLMENTS" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold" : "text-slate-500"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History ({currentWorkflow?.enrolledLeadsCount || 0})</span>
          </button>
        </div>

        {/* Right: Status Switch & Save */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active / Draft Toggle */}
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span>{isActive ? "Published" : "Draft"}</span>
          </button>

          {/* Test Simulation Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTestLogs([]);
              setIsTestModalOpen(true);
            }}
            className="text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
          >
            <Play className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Test Workflow</span>
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleSaveWorkflow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      {saveAlert && (
        <div className="absolute top-20 right-6 z-50 p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* 2. TAB: BUILDER CANVAS (GoHighLevel Flowchart) */}
      {activeTab === "BUILDER" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="w-full max-w-2xl flex flex-col items-center">
            {/* TRIGGER NODE (Top of Flow) */}
            <div
              onClick={() => setIsTriggerDrawerOpen(true)}
              className="group relative w-full max-w-md bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:border-indigo-600 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Workflow Trigger
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {trigger}
                    </h3>
                  </div>
                </div>
                <Badge variant="purple" className="text-[10px] font-bold">
                  Start Event
                </Badge>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                {triggerConfig.formName ? `Filtered: ${triggerConfig.formName}` : "Click to select trigger event & filter conditions"}
              </p>
            </div>

            {/* Vertical Connector Line & '+' button after Trigger */}
            <div className="flex flex-col items-center my-2">
              <div className="w-0.5 h-6 bg-indigo-300 dark:bg-indigo-900" />
              <button
                onClick={() => handleOpenAddAction(0, "main")}
                className="h-7 w-7 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center shadow-md hover:scale-110 transition-all cursor-pointer group"
                title="Add Action"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="w-0.5 h-6 bg-indigo-300 dark:bg-indigo-900" />
            </div>

            {/* STEP CARDS */}
            {steps.map((step, index) => {
              const theme = getActionTheme(step.actionType);
              const IconComponent = theme.icon;

              return (
                <React.Fragment key={step.id}>
                  {/* Step Card */}
                  <div
                    onClick={() => {
                      setSelectedStep(step);
                      setIsDrawerOpen(true);
                    }}
                    className={`group relative w-full max-w-md bg-white dark:bg-slate-900 border-2 ${theme.border} rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-800`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              STEP {index + 1}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.color}`}>
                              {theme.badge}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {step.actionTitle}
                          </h4>

                          {/* Quick details summary */}
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {step.actionType === "SEND_WHATSAPP" && (
                              <span>💬 {step.customMessage || step.templateName}</span>
                            )}
                            {step.actionType === "SEND_EMAIL" && (
                              <span>✉️ Subject: &quot;{step.customSubject || step.templateName}&quot;</span>
                            )}
                            {step.actionType === "WAIT_DELAY" && (
                              <span>⏳ Wait duration: {step.delayValue || step.dayDelay} {step.delayUnit || "days"}</span>
                            )}
                            {step.actionType === "UPDATE_STATUS" && (
                              <span>📊 New Status: <strong className="text-indigo-600">{step.leadStatus || "Contacted"}</strong></span>
                            )}
                            {step.actionType === "ADD_TAG" && (
                              <span>🏷️ Add Tag: <strong className="text-violet-600">#{step.tag || "Inbound"}</strong></span>
                            )}
                            {step.actionType === "IF_ELSE" && (
                              <span>🔀 Check if: <strong>{step.conditionField} {step.conditionOperator}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDuplicateStep(step, index)}
                          className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Duplicate Step"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="Delete Step"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* IF/ELSE BRANCHING VISUALIZATION */}
                  {step.actionType === "IF_ELSE" && (
                    <div className="w-full max-w-xl my-3 px-2">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Branch YES */}
                        <div className="flex flex-col items-center bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl p-3 dark:bg-emerald-950/20 dark:border-emerald-800">
                          <Badge variant="success" className="text-[10px] font-bold mb-2">
                            YES (Condition Met)
                          </Badge>

                          {(step.yesSteps || []).map((ys) => (
                            <div
                              key={ys.id}
                              onClick={() => {
                                setSelectedStep(ys);
                                setIsDrawerOpen(true);
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-emerald-300 rounded-xl p-2.5 shadow-xs mb-2 text-xs cursor-pointer"
                            >
                              <p className="font-bold text-slate-900 dark:text-white truncate">{ys.actionTitle}</p>
                              <span className="text-[10px] text-emerald-600">{ys.actionType}</span>
                            </div>
                          ))}

                          <button
                            onClick={() => handleOpenAddAction(0, "yes", step.id)}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer mt-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add YES Action</span>
                          </button>
                        </div>

                        {/* Branch NO */}
                        <div className="flex flex-col items-center bg-slate-100 border-2 border-slate-200 rounded-2xl p-3 dark:bg-slate-900 dark:border-slate-800">
                          <Badge variant="outline" className="text-[10px] font-bold mb-2">
                            NO (Condition Not Met)
                          </Badge>

                          {(step.noSteps || []).map((ns) => (
                            <div
                              key={ns.id}
                              onClick={() => {
                                setSelectedStep(ns);
                                setIsDrawerOpen(true);
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 rounded-xl p-2.5 shadow-xs mb-2 text-xs cursor-pointer"
                            >
                              <p className="font-bold text-slate-900 dark:text-white truncate">{ns.actionTitle}</p>
                              <span className="text-[10px] text-slate-500">{ns.actionType}</span>
                            </div>
                          ))}

                          <button
                            onClick={() => handleOpenAddAction(0, "no", step.id)}
                            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer mt-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add NO Action</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vertical Connector Line & '+' button between steps */}
                  <div className="flex flex-col items-center my-2">
                    <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-800" />
                    <button
                      onClick={() => handleOpenAddAction(index + 1, "main")}
                      className="h-7 w-7 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center shadow-md hover:scale-110 transition-all cursor-pointer group"
                      title="Add Action"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-800" />
                  </div>
                </React.Fragment>
              );
            })}

            {/* END OF WORKFLOW CARD */}
            <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Workflow Ends</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: SETTINGS */}
      {activeTab === "SETTINGS" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-indigo-600" />
                <span>Workflow Execution Settings</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Configure contact re-entry rules, response behavior, and sender defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Stop on Contact Response</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Immediately stop sending automated emails & WhatsApp messages if the lead replies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStopOnResponse(!stopOnResponse)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    stopOnResponse ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      stopOnResponse ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Allow Contact Re-Entry</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Allow a contact to enter this workflow multiple times (e.g. for every form submission).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowReEntry(!allowReEntry)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    allowReEntry ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowReEntry ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Workflow Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what this automation does for your team..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button onClick={handleSaveWorkflow} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. TAB: ENROLLMENT HISTORY */}
      {activeTab === "ENROLLMENTS" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  <span>Workflow Enrolled Leads</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Contacts that have entered or are currently progressing through this workflow.
                </CardDescription>
              </div>
              <Badge variant="purple" className="text-xs font-bold">
                {currentWorkflow?.enrolledLeadsCount || 0} Total Enrolled
              </Badge>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              {scopedLeads.filter((l) => l.activeWorkflowId === workflowId).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <History className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active leads currently in this workflow</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Leads will show up here automatically when they submit a connected form or are enrolled manually.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scopedLeads
                    .filter((l) => l.activeWorkflowId === workflowId)
                    .map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs dark:bg-slate-900 dark:border-slate-800"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{lead.name}</p>
                          <p className="text-[11px] text-slate-400">{lead.phone || lead.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-[10px]">
                            In Progress
                          </Badge>
                          <span className="text-[10px] text-slate-400">Enrolled {new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. SLIDE-OUT ACTION CONFIGURATION DRAWER (GoHighLevel Right Panel) */}
      {isDrawerOpen && selectedStep && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Configure Action</h3>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{selectedStep.actionType}</span>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Form Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Action Title */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Action Name</label>
              <Input
                value={selectedStep.actionTitle}
                onChange={(e) => handleUpdateSelectedStep({ actionTitle: e.target.value })}
                placeholder="e.g. Send Welcome WhatsApp"
              />
            </div>

            {/* A. WHATSAPP CONFIG */}
            {selectedStep.actionType === "SEND_WHATSAPP" && (
              <div className="space-y-3 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl dark:bg-emerald-950/20 dark:border-emerald-800">
                <div>
                  <label className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-1">Select WhatsApp Template</label>
                  <select
                    value={selectedStep.templateId || ""}
                    onChange={(e) => {
                      const t = templates.find((tpl) => tpl.id === e.target.value);
                      handleUpdateSelectedStep({
                        templateId: e.target.value,
                        templateName: t?.name || "WhatsApp Template",
                        customMessage: t?.body || selectedStep.customMessage,
                      });
                    }}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                  >
                    <option value="">-- Custom WhatsApp Message --</option>
                    {templates.filter((t) => t.channel === "WhatsApp").map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-emerald-900 dark:text-emerald-200">Message Content</label>
                    <span className="text-[10px] text-slate-400">Supports variables: &#123;&#123;name&#125;&#125;, &#123;&#123;company&#125;&#125;</span>
                  </div>
                  <textarea
                    rows={4}
                    value={selectedStep.customMessage || ""}
                    onChange={(e) => handleUpdateSelectedStep({ customMessage: e.target.value })}
                    placeholder="Hi {{name}}! Thank you for reaching out..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white font-sans dark:bg-slate-950"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1">
                    {["{{name}}", "{{company}}", "{{phone}}", "{{email}}"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleUpdateSelectedStep({ customMessage: `${selectedStep.customMessage || ""} ${tag}` })}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* B. EMAIL CONFIG */}
            {selectedStep.actionType === "SEND_EMAIL" && (
              <div className="space-y-3 p-3.5 bg-sky-50/50 border border-sky-200 rounded-xl dark:bg-sky-950/20 dark:border-sky-800">
                <div>
                  <label className="font-semibold text-sky-900 dark:text-sky-200 block mb-1">Select Email Template</label>
                  <select
                    value={selectedStep.templateId || ""}
                    onChange={(e) => {
                      const t = templates.find((tpl) => tpl.id === e.target.value);
                      handleUpdateSelectedStep({
                        templateId: e.target.value,
                        templateName: t?.name || "Email Template",
                        customSubject: t?.subject || selectedStep.customSubject,
                        customMessage: t?.body || selectedStep.customMessage,
                      });
                    }}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                  >
                    <option value="">-- Custom Email --</option>
                    {templates.filter((t) => t.channel === "Email").map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-sky-900 dark:text-sky-200 block mb-1">Email Subject Line</label>
                  <Input
                    value={selectedStep.customSubject || ""}
                    onChange={(e) => handleUpdateSelectedStep({ customSubject: e.target.value })}
                    placeholder="e.g. Welcome {{name}} — Consultation Details"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sky-900 dark:text-sky-200 block mb-1">Email Body</label>
                  <textarea
                    rows={4}
                    value={selectedStep.customMessage || ""}
                    onChange={(e) => handleUpdateSelectedStep({ customMessage: e.target.value })}
                    placeholder="Hi {{name}},\n\nThank you for reaching out..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white font-sans dark:bg-slate-950"
                  />
                </div>
              </div>
            )}

            {/* C. WAIT / DELAY CONFIG */}
            {selectedStep.actionType === "WAIT_DELAY" && (
              <div className="space-y-3 p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl dark:bg-amber-950/20 dark:border-amber-800">
                <label className="font-semibold text-amber-900 dark:text-amber-200 block mb-1">Wait Duration</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={selectedStep.delayValue || selectedStep.dayDelay || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      handleUpdateSelectedStep({
                        delayValue: val,
                        dayDelay: selectedStep.delayUnit === "days" ? val : 0,
                      });
                    }}
                    className="w-28"
                  />
                  <select
                    value={selectedStep.delayUnit || "days"}
                    onChange={(e) => {
                      const unit = e.target.value as "minutes" | "hours" | "days";
                      handleUpdateSelectedStep({
                        delayUnit: unit,
                        dayDelay: unit === "days" ? (selectedStep.delayValue || 1) : 0,
                      });
                    }}
                    className="flex-1 h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            )}

            {/* D. STATUS UPDATE CONFIG */}
            {selectedStep.actionType === "UPDATE_STATUS" && (
              <div className="space-y-3 p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl dark:bg-indigo-950/20 dark:border-indigo-800">
                <label className="font-semibold text-indigo-900 dark:text-indigo-200 block mb-1">Set Lead Status To</label>
                <select
                  value={selectedStep.leadStatus || "Contacted"}
                  onChange={(e) => handleUpdateSelectedStep({ leadStatus: e.target.value as LeadStatus })}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                >
                  {ALL_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}

            {/* E. TAG CONFIG */}
            {(selectedStep.actionType === "ADD_TAG" || selectedStep.actionType === "REMOVE_TAG") && (
              <div className="space-y-3 p-3.5 bg-violet-50/50 border border-violet-200 rounded-xl dark:bg-violet-950/20 dark:border-violet-800">
                <label className="font-semibold text-violet-900 dark:text-violet-200 block mb-1">Tag Name</label>
                <Input
                  value={selectedStep.tag || ""}
                  onChange={(e) => handleUpdateSelectedStep({ tag: e.target.value })}
                  placeholder="e.g. Hot Lead, Webinar, Demo Booked"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Hot Lead", "Inbound", "Consultation", "VIP", "Follow-up", "Cold"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleUpdateSelectedStep({ tag: preset })}
                      className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 hover:border-violet-400 cursor-pointer dark:bg-slate-900"
                    >
                      #{preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* F. ASSIGN USER CONFIG */}
            {selectedStep.actionType === "ASSIGN_USER" && (
              <div className="space-y-3 p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl dark:bg-blue-950/20 dark:border-blue-800">
                <label className="font-semibold text-blue-900 dark:text-blue-200 block mb-1">Assign Contact To</label>
                <select
                  value={selectedStep.assignedUserId || ""}
                  onChange={(e) => {
                    const u = users.find((usr) => usr.id === e.target.value);
                    handleUpdateSelectedStep({
                      assignedUserId: e.target.value,
                      assignedUserName: u?.name || "Admin",
                    });
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                >
                  <option value="">-- Select Team Member --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}

            {/* G. IF/ELSE CONDITION CONFIG */}
            {selectedStep.actionType === "IF_ELSE" && (
              <div className="space-y-3 p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl dark:bg-purple-950/20 dark:border-purple-800">
                <div>
                  <label className="font-semibold text-purple-900 dark:text-purple-200 block mb-1">Condition Field</label>
                  <select
                    value={selectedStep.conditionField || "replied"}
                    onChange={(e) => handleUpdateSelectedStep({ conditionField: e.target.value as any })}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                  >
                    <option value="replied">Customer Replied to Message</option>
                    <option value="status">Lead Status</option>
                    <option value="tag">Contact Has Tag</option>
                    <option value="channel">Channel is WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-purple-900 dark:text-purple-200 block mb-1">Operator</label>
                  <select
                    value={selectedStep.conditionOperator || "is_true"}
                    onChange={(e) => handleUpdateSelectedStep({ conditionOperator: e.target.value as any })}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                  >
                    <option value="is_true">Is True (Yes)</option>
                    <option value="is_false">Is False (No)</option>
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteStep(selectedStep.id)}
              className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Action</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Action</span>
            </Button>
          </div>
        </div>
      )}

      {/* 6. TRIGGER CONFIGURATION DRAWER */}
      {isTriggerDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Workflow Trigger</h3>
                <span className="text-[10px] text-slate-500">WHEN THIS EVENT OCCURS...</span>
              </div>
            </div>
            <button
              onClick={() => setIsTriggerDrawerOpen(false)}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Trigger Event</label>
              <select
                value={trigger}
                onChange={(e) => {
                  setTrigger(e.target.value);
                  if (e.target.value.includes("Form")) setTriggerType("FORM_SUBMITTED");
                  else if (e.target.value.includes("Tag")) setTriggerType("TAG_ADDED");
                  else if (e.target.value.includes("Status")) setTriggerType("STATUS_CHANGED");
                  else setTriggerType("LEAD_CREATED");
                }}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
              >
                <option value="Web Form Submitted">📥 Web Form Submitted</option>
                <option value="New Lead Created">👤 New Lead Created</option>
                <option value="Tag Added to Contact">🏷️ Tag Added to Contact</option>
                <option value="Lead Status Changed">📊 Lead Status Changed</option>
                <option value="Inbound WhatsApp Received">💬 Inbound WhatsApp Received</option>
                <option value="Manual Contact Enrollment">⚡ Manual Contact Enrollment</option>
              </select>
            </div>

            {trigger.includes("Form") && forms.length > 0 && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Filter by Specific Form</label>
                <select
                  value={triggerConfig.formId || ""}
                  onChange={(e) => {
                    const f = forms.find((frm) => frm.id === e.target.value);
                    setTriggerConfig({ ...triggerConfig, formId: e.target.value, formName: f?.title });
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                >
                  <option value="">Any Web Form</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950">
            <Button
              size="sm"
              onClick={() => setIsTriggerDrawerOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* 7. GOHIGHLEVEL 'ADD ACTION' MODAL */}
      {isAddActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-600" />
                  <span>Select Action to Add</span>
                </h3>
                <p className="text-[11px] text-slate-400">Choose what should happen next in this automation sequence.</p>
              </div>
              <button
                onClick={() => setIsAddActionModalOpen(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search & Categories Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search actions (e.g. WhatsApp, Email, Delay, Tag)..."
                  value={actionSearchQuery}
                  onChange={(e) => setActionSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {["ALL", "COMMUNICATION", "TIMING", "LOGIC", "CRM"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedActionCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer shrink-0 transition-colors ${
                      selectedActionCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* WhatsApp */}
              <div
                onClick={() => handleSelectActionType("SEND_WHATSAPP")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-emerald-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">Send WhatsApp</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send automated WhatsApp message or Cloud API template.</p>
                </div>
              </div>

              {/* Email */}
              <div
                onClick={() => handleSelectActionType("SEND_EMAIL")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 dark:border-slate-800 dark:hover:bg-sky-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-700">Send Email</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send customized email or select marketing template.</p>
                </div>
              </div>

              {/* Wait Delay */}
              <div
                onClick={() => handleSelectActionType("WAIT_DELAY")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 dark:border-slate-800 dark:hover:bg-amber-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-700">Wait / Delay</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Wait a specified number of minutes, hours, or days.</p>
                </div>
              </div>

              {/* If / Else */}
              <div
                onClick={() => handleSelectActionType("IF_ELSE")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 dark:border-slate-800 dark:hover:bg-purple-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700">If / Else Condition</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Branch workflow into Yes / No paths based on rules.</p>
                </div>
              </div>

              {/* Update Status */}
              <div
                onClick={() => handleSelectActionType("UPDATE_STATUS")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-indigo-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-700">Update Lead Status</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Change contact status (e.g. Contacted, Interested).</p>
                </div>
              </div>

              {/* Add Tag */}
              <div
                onClick={() => handleSelectActionType("ADD_TAG")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 dark:border-slate-800 dark:hover:bg-violet-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-700">Add Tag</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tag the contact with custom labels (e.g. Hot Lead).</p>
                </div>
              </div>

              {/* Assign User */}
              <div
                onClick={() => handleSelectActionType("ASSIGN_USER")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-700">Assign to User</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Route contact to specific sales representative.</p>
                </div>
              </div>

              {/* Internal Notify */}
              <div
                onClick={() => handleSelectActionType("INTERNAL_NOTIFY")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 dark:border-slate-800 dark:hover:bg-orange-950/20 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-orange-700">Internal Notification</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Alert agency admin or sales reps via notification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TEST SIMULATION MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Play className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Simulation Runner</h3>
                  <p className="text-[11px] text-slate-500">Simulate step-by-step execution on real contact data.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Contact to Test With</label>
              <select
                value={testLeadId}
                onChange={(e) => setTestLeadId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
              >
                <option value="">-- Sample Prospect (John Doe) --</option>
                {scopedLeads.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.phone || l.email})</option>
                ))}
              </select>
            </div>

            {/* Simulation Log Console */}
            <div className="bg-slate-950 text-slate-200 font-mono text-[11px] rounded-xl p-3.5 h-48 overflow-y-auto space-y-1.5 border border-slate-800">
              {testLogs.length === 0 ? (
                <p className="text-slate-500 italic">Click &quot;Run Test Simulation&quot; to test workflow execution...</p>
              ) : (
                testLogs.map((log, i) => (
                  <p key={i} className="leading-relaxed">{log}</p>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                disabled={isSimulating}
                onClick={handleRunTest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
              >
                <Play className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "Simulating..." : "Run Test Simulation"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

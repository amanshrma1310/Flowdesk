"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  Trash2,
  Edit,
  Play,
  Pause,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { Workflow, WorkflowStep, TemplateChannel } from "@/lib/types";

export default function WorkflowsPage() {
  const {
    workflows,
    templates,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowActive,
  } = useFlowDesk();

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  // Form Fields
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "step-1",
      stepNumber: 1,
      dayDelay: 0,
      channel: "Email",
      templateId: templates[0]?.id || "",
      templateName: templates[0]?.name || "Template",
      actionTitle: "Initial Email Outreach",
    },
    {
      id: "step-2",
      stepNumber: 2,
      dayDelay: 2,
      channel: "WhatsApp",
      templateId: templates.find((t) => t.channel === "WhatsApp")?.id || templates[0]?.id || "",
      templateName: templates.find((t) => t.channel === "WhatsApp")?.name || "Template",
      actionTitle: "Follow-up WhatsApp Message",
    },
  ]);

  const openCreateModal = () => {
    setEditingWorkflowId(null);
    setWorkflowName("");
    setDescription("");
    setSteps([
      {
        id: "step-1",
        stepNumber: 1,
        dayDelay: 0,
        channel: "Email",
        templateId: templates[0]?.id || "",
        templateName: templates[0]?.name || "Template",
        actionTitle: "Initial Email Outreach",
      },
      {
        id: "step-2",
        stepNumber: 2,
        dayDelay: 2,
        channel: "WhatsApp",
        templateId: templates.find((t) => t.channel === "WhatsApp")?.id || templates[0]?.id || "",
        templateName: templates.find((t) => t.channel === "WhatsApp")?.name || "Template",
        actionTitle: "Follow-up WhatsApp Message",
      },
    ]);
    setIsOpen(true);
  };

  const openEditModal = (wf: Workflow) => {
    setEditingWorkflowId(wf.id);
    setWorkflowName(wf.name);
    setDescription(wf.description || "");
    setSteps(wf.steps && wf.steps.length > 0 ? wf.steps : [
      {
        id: "step-1",
        stepNumber: 1,
        dayDelay: 0,
        channel: "Email",
        templateId: templates[0]?.id || "",
        templateName: templates[0]?.name || "Template",
        actionTitle: "Initial Email Outreach",
      },
    ]);
    setIsOpen(true);
  };

  const addStep = () => {
    const nextNum = steps.length + 1;
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextNum,
      dayDelay: nextNum * 2,
      channel: "WhatsApp",
      templateId: templates[0]?.id || "",
      templateName: templates[0]?.name || "Template",
      actionTitle: `Day ${nextNum * 2}: Follow-up Step ${nextNum}`,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowName.trim() || steps.length === 0) return;

    if (editingWorkflowId) {
      updateWorkflow(editingWorkflowId, {
        name: workflowName,
        description,
        steps,
      });
    } else {
      createWorkflow({
        name: workflowName,
        description,
        trigger: "Lead Added",
        steps,
        onPositiveResponse: "Status = Interested & Stop automated messages & Notify Employee",
        onNegativeResponse: "Status = Not Interested & Stop Campaign",
        onNoResponse: "Send Next Follow-up",
        isActive: true,
      });
    }

    setIsOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Workflows & Follow-up Sequences
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {workflows.length} Active Sequences
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-step automated drips with response branching — accessible by Admin, Managers, and Employees (PDF Pages 10, 11, 12, 16).
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>

      {/* Workflows List */}
      <div className="space-y-6">
        {workflows.map((wf) => (
          <Card key={wf.id} className="hover:border-indigo-300 transition-all overflow-hidden">
            <CardHeader className="p-5 pb-3 bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <CardTitle className="text-sm font-bold">{wf.name}</CardTitle>
                    <Badge variant={wf.isActive ? "success" : "secondary"} className="text-[10px]">
                      {wf.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {wf.description || "Automated drip sequence with response detection."}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {wf.enrolledLeadsCount} Enrolled Leads
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(wf)}
                    className="text-xs h-8 gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit Sequence</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleWorkflowActive(wf.id)}
                    className="text-xs h-8 gap-1"
                  >
                    {wf.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span>{wf.isActive ? "Pause" : "Activate"}</span>
                  </Button>
                  <button
                    onClick={() => deleteWorkflow(wf.id)}
                    title="Delete Workflow"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Trigger & Steps Flowchart (PDF Pages 10 & 11) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Workflow Execution Pipeline:
                </span>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="p-2 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg font-bold">
                    Trigger: {wf.trigger}
                  </div>

                  {wf.steps?.map((st, i) => (
                    <React.Fragment key={st.id || i}>
                      <span className="text-slate-400 font-bold">➔</span>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-0.5 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {st.channel === "WhatsApp" ? <Send className="h-3 w-3 text-emerald-600" /> : <Mail className="h-3 w-3 text-sky-600" />}
                          <span>{st.actionTitle}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Delay: {st.dayDelay} Days • {st.templateName}
                        </p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Response-Based Branching Logic (PDF Page 12) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs dark:bg-slate-800/60 dark:border-slate-700">
                <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-purple-600" />
                  <span>Response-Based Automation Branching (Automatic):</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                    <strong>Positive Reply:</strong> Status = Interested ➔ Stop automated messages ➔ Notify Employee.
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                    <strong>Negative Reply:</strong> Status = Not Interested ➔ Stop Campaign ➔ Remove from sequence.
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                    <strong>No Reply:</strong> Wait delay ➔ Send next follow-up message automatically.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT WORKFLOW MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>{editingWorkflowId ? "Edit Follow-up Workflow" : "Create Follow-up Workflow"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure multi-step outreach with delays and automatic response handlers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Workflow Name *</label>
              <Input
                required
                placeholder="e.g. 14-Day High-Touch Drip"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Description</label>
              <Input
                placeholder="e.g. 1 email, 2 WhatsApp messages over 14 days"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Sequence Steps Builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Follow-up Steps:</label>
                <Button type="button" size="sm" variant="outline" onClick={addStep} className="text-[11px] h-7 gap-1">
                  <Plus className="h-3 w-3" />
                  <span>Add Step</span>
                </Button>
              </div>

              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={step.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span>Step {idx + 1}</span>
                      {steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Channel</label>
                        <select
                          value={step.channel}
                          onChange={(e) => {
                            const newChan = e.target.value as TemplateChannel;
                            setSteps(
                              steps.map((s, i) => (i === idx ? { ...s, channel: newChan } : s))
                            );
                          }}
                          className="w-full h-8 rounded border border-slate-200 text-xs px-2 bg-white"
                        >
                          <option value="Email">Email</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Delay (Days from Lead Added)</label>
                        <Input
                          type="number"
                          value={step.dayDelay}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setSteps(
                              steps.map((s, i) => (i === idx ? { ...s, dayDelay: val, actionTitle: `Day ${val + 1}: Step ${idx + 1}` } : s))
                            );
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Select Template</label>
                      <select
                        value={step.templateId}
                        onChange={(e) => {
                          const targetTpl = templates.find((t) => t.id === e.target.value);
                          setSteps(
                            steps.map((s, i) =>
                              i === idx
                                ? { ...s, templateId: e.target.value, templateName: targetTpl?.name || "Template" }
                                : s
                            )
                          );
                        }}
                        className="w-full h-8 rounded border border-slate-200 text-xs px-2 bg-white"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                {editingWorkflowId ? "Save Changes" : "Create Workflow"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

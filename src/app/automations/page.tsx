"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Plus,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Edit3,
  Play,
  Copy,
  Sparkles,
  GitBranch,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  UserCheck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";
import { Workflow, WorkflowStep } from "@/lib/types";
import { WORKFLOW_RECIPES } from "@/lib/workflowTemplates";

export default function WorkflowsListPage() {
  const router = useRouter();
  const {
    workflows,
    createWorkflow,
    deleteWorkflow,
    toggleWorkflowActive,
  } = useFlowDesk();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "DRAFT">("ALL");

  // Create from Recipe in 1 Click
  const handleUseRecipe = (recipeId: string) => {
    const recipe = WORKFLOW_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    const created = createWorkflow({
      name: recipe.name.replace(/^[^\w]+/, "").trim(),
      description: recipe.description,
      trigger: recipe.trigger,
      triggerType: recipe.triggerType,
      triggerConfig: recipe.triggerConfig || {},
      steps: recipe.steps,
      onPositiveResponse: recipe.onPositiveResponse || "Status = Interested & Stop automated messages & Notify Employee",
      onNegativeResponse: recipe.onNegativeResponse || "Status = Not Interested & Stop Campaign",
      onNoResponse: recipe.onNoResponse || "Send Next Follow-up",
      isActive: true,
      allowReEntry: false,
      stopOnResponse: true,
    });

    router.push(`/automations/${created.id}`);
  };

  // Duplicate Workflow
  const handleDuplicateWorkflow = (wf: Workflow) => {
    const created = createWorkflow({
      name: `${wf.name} (Copy)`,
      description: wf.description,
      trigger: wf.trigger,
      triggerType: wf.triggerType,
      triggerConfig: wf.triggerConfig,
      steps: wf.steps,
      onPositiveResponse: wf.onPositiveResponse,
      onNegativeResponse: wf.onNegativeResponse,
      onNoResponse: wf.onNoResponse,
      isActive: false,
      allowReEntry: wf.allowReEntry,
      stopOnResponse: wf.stopOnResponse,
    });
    router.push(`/automations/${created.id}`);
  };

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch =
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wf.description && wf.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      wf.trigger.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && wf.isActive) ||
      (filterStatus === "DRAFT" && !wf.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeCount = workflows.filter((w) => w.isActive).length;
  const totalEnrolled = workflows.reduce((acc, w) => acc + (w.enrolledLeadsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Automation Workflows
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              GoHighLevel Studio
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Build visual marketing workflows, automated WhatsApp & email drip sequences, and lead routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/automations/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Create Workflow</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Workflows</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{workflows.length}</p>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active (Live)</span>
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Leads</span>
            <UserCheck className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{totalEnrolled}</p>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Pre-Built Recipes</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{WORKFLOW_RECIPES.length}</p>
        </Card>
      </div>

      {/* 3. GoHighLevel Proven Workflow Recipes (1-Click Launch) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Workflow Recipes
            </h2>
          </div>
          <span className="text-xs text-slate-400">1-Click Clone & Launch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {WORKFLOW_RECIPES.map((recipe) => (
            <Card
              key={recipe.id}
              className="flex flex-col justify-between p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" className="text-[10px] font-bold">
                    {recipe.badge}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {recipe.steps.length} Steps
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {recipe.name}
                </h3>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Steps Visual Chain */}
                <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-400 overflow-x-auto pb-1">
                  {recipe.steps.slice(0, 3).map((s, idx) => (
                    <span key={s.id} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium shrink-0">
                      {s.actionType === "SEND_WHATSAPP" ? "💬 WhatsApp" : s.actionType === "SEND_EMAIL" ? "✉️ Email" : s.actionType === "WAIT_DELAY" ? "⏳ Delay" : s.actionTitle.slice(0, 10)}
                      {idx < 2 && " ➔"}
                    </span>
                  ))}
                  {recipe.steps.length > 3 && <span className="text-slate-400 shrink-0">+{recipe.steps.length - 3}</span>}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Trigger: {recipe.trigger.slice(0, 16)}...</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseRecipe(recipe.id)}
                  className="text-xs h-7 px-2.5 font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border-indigo-200 gap-1 cursor-pointer"
                >
                  <span>Use Recipe</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Active Workflows Table / List */}
      <Card>
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-indigo-600" />
                <span>Configured Workflows</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Manage, pause, test, or open the visual builder for your agency workflows.
              </CardDescription>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-2 py-1 rounded-md cursor-pointer ${filterStatus === "ALL" ? "bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white" : "text-slate-500"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("ACTIVE")}
                  className={`px-2 py-1 rounded-md cursor-pointer ${filterStatus === "ACTIVE" ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600" : "text-slate-500"}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus("DRAFT")}
                  className={`px-2 py-1 rounded-md cursor-pointer ${filterStatus === "DRAFT" ? "bg-white dark:bg-slate-900 shadow-xs text-slate-600" : "text-slate-500"}`}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
                <GitBranch className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No workflows found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery ? "No workflows match your search query." : "Pick one of the GoHighLevel recipes above or click create to build your first workflow."}
                </p>
              </div>
              <Link href="/automations/new">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 mt-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Build First Workflow</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/automations/${wf.id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 transition-colors truncate"
                      >
                        {wf.name}
                      </Link>

                      <Badge
                        variant={wf.isActive ? "success" : "outline"}
                        className="text-[10px] font-bold"
                      >
                        {wf.isActive ? "● Active" : "Draft"}
                      </Badge>
                    </div>

                    {wf.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{wf.description}</p>
                    )}

                    {/* Trigger & Steps Pill Trail */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        <Zap className="h-3 w-3" />
                        <span>{wf.trigger}</span>
                      </span>

                      <span>•</span>
                      <span>{wf.steps?.length || 0} Actions in Flow</span>

                      <span>•</span>
                      <span>{wf.enrolledLeadsCount || 0} Enrolled Leads</span>

                      <span>•</span>
                      <span>Created {wf.createdAt}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => toggleWorkflowActive(wf.id)}
                      className={`h-7 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        wf.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                      title="Toggle Active/Draft"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${wf.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{wf.isActive ? "Active" : "Paused"}</span>
                    </button>

                    {/* Open in Builder Button */}
                    <Link href={`/automations/${wf.id}`}>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 h-8 shadow-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Open Builder</span>
                      </Button>
                    </Link>

                    {/* Duplicate */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateWorkflow(wf)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                      title="Duplicate Workflow"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete workflow "${wf.name}"?`)) {
                          deleteWorkflow(wf.id);
                        }
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Workflow"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

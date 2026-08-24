"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Pause,
  ExternalLink,
  Bot,
  Copy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { explainAutomationFlow } from "@/lib/ai/flowExplainer";

export default function AutomationsPage() {
  const { automations, toggleAutomationStatus } = useFlowDesk();
  const [selectedExplainingAuto, setSelectedExplainingAuto] = useState<any | null>(null);

  const activeCount = automations.filter((a) => a.status === "ACTIVE").length;
  const errorCount = automations.filter((a) => a.status === "ERROR").length;
  const totalRuns = automations.reduce((acc, a) => acc + a.executionCount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              No-Code Automations & Workflows
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {activeCount} Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automate WhatsApp, email, tasks, and lead assignments with zero developer intervention.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/automations/templates">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Browse Recipes & Templates</span>
            </Button>
          </Link>
          <Link href="/automations/auto-1">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Create Workflow</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Automation Health & Monitoring Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
                Active Automations
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 dark:text-white">{activeCount}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center dark:bg-emerald-900/50 dark:text-emerald-300">
              <Zap className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/20 dark:border-indigo-950 dark:bg-indigo-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider dark:text-indigo-300">
                Total Executions
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 dark:text-white">{totalRuns.toLocaleString()}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center dark:bg-indigo-900/50 dark:text-indigo-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/20 dark:border-rose-950 dark:bg-rose-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider dark:text-rose-300">
                Workflows with Errors
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 dark:text-white">{errorCount}</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center dark:bg-rose-900/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((auto) => (
          <Card key={auto.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                      auto.status === "ACTIVE"
                        ? "bg-emerald-600"
                        : auto.status === "ERROR"
                        ? "bg-rose-600"
                        : "bg-slate-500"
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/automations/${auto.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors dark:text-slate-100"
                      >
                        {auto.name}
                      </Link>
                      <Badge
                        variant={
                          auto.status === "ACTIVE"
                            ? "success"
                            : auto.status === "ERROR"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {auto.status}
                      </Badge>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950 dark:text-indigo-300">
                        {auto.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      {auto.description}
                    </p>

                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 font-medium">
                      <span>Executions: <strong className="text-slate-700 dark:text-slate-300">{auto.executionCount}</strong></span>
                      <span>Success: <strong className="text-emerald-600">{auto.successCount}</strong></span>
                      {auto.failureCount > 0 && <span>Failed: <strong className="text-rose-600">{auto.failureCount}</strong></span>}
                      {auto.lastRunAt && <span>Last run: {auto.lastRunAt}</span>}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedExplainingAuto(auto)}
                    className="text-xs text-purple-700 hover:bg-purple-50 gap-1 dark:text-purple-300"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Explain</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAutomationStatus(auto.id)}
                    className="text-xs h-8"
                  >
                    {auto.status === "ACTIVE" ? (
                      <>
                        <Pause className="h-3 w-3 mr-1 text-slate-500" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1 text-emerald-600" /> Activate
                      </>
                    )}
                  </Button>

                  <Link href={`/automations/${auto.id}`}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 gap-1">
                      <span>Visual Canvas</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Explainer Modal */}
      {selectedExplainingAuto && (
        <Dialog open={Boolean(selectedExplainingAuto)} onOpenChange={() => setSelectedExplainingAuto(null)}>
          <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">{selectedExplainingAuto.name}</DialogTitle>
                  <DialogDescription className="text-xs">Plain-English workflow summary</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
              {explainAutomationFlow(
                selectedExplainingAuto.flowDefinition?.nodes || [],
                selectedExplainingAuto.flowDefinition?.edges || []
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

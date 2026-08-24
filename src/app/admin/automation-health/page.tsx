"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Zap,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

export default function AdminAutomationHealthPage() {
  const { automations } = useFlowDesk();
  const [fixedAlert, setFixedAlert] = useState<string | null>(null);

  const handleFixError = (autoId: string) => {
    setFixedAlert("Template re-synced with Meta WhatsApp API! Queued retry for 22 delayed messages.");
    setTimeout(() => setFixedAlert(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Automation Health & Error Center
          </h1>
          <Badge variant="purple" className="text-xs font-bold">Admin Console</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time background worker diagnostics, failed step trace logs, and 1-click self-healing actions.
        </p>
      </div>

      {fixedAlert && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{fixedAlert}</span>
        </div>
      )}

      {/* 3 Status Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
                Successful Executions
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">12,450</p>
              <p className="text-[11px] text-slate-500 mt-0.5">99.8% execution rate</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/20 dark:border-amber-950 dark:bg-amber-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider dark:text-amber-300">
                Waiting / Delayed Steps
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">83</p>
              <p className="text-[11px] text-slate-500 mt-0.5">BullMQ delayed delay queue</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center dark:bg-amber-900/50 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/20 dark:border-rose-950 dark:bg-rose-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider dark:text-rose-300">
                Failed Workflows
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">17</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Requires 1-click template fix</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center dark:bg-rose-900/50 dark:text-rose-300">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Log Breakdown */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>Workflow Incident Diagnostics & Resolution</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Non-technical business owners can understand and resolve automation failures in 1 click.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-rose-950/20 dark:border-rose-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                  Old Lead Recovery & Re-engagement
                </span>
                <Badge variant="destructive" className="text-[10px]">22 Failed Messages</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Cause:</strong> WhatsApp message failed because template <code className="bg-white px-1 py-0.5 rounded text-[11px]">special_winback_offer</code> was pending Meta verification.
              </p>
              <p className="text-[11px] text-slate-400">Last attempt: 1 hour ago • Auto-retry queued</p>
            </div>

            <Button
              size="sm"
              onClick={() => handleFixError("auto-3")}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shrink-0"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Fix & Auto-Retry</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Response-Based 360° Follow-up Engine
                </span>
                <Badge variant="success" className="text-[10px]">1,218 Healthy Runs</Badge>
              </div>
              <p className="text-xs text-slate-500">
                All WhatsApp API webhooks and response classifier steps operating at 100% uptime.
              </p>
            </div>

            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Healthy
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

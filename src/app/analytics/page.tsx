"use client";

import React from "react";
import {
  TrendingUp,
  Send,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  Flame,
  BarChart3,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

export default function AnalyticsPage() {
  const { contacts, automations } = useFlowDesk();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance & Automation Analytics
          </h1>
          <Badge variant="purple" className="text-xs font-bold">
            Live Metrics
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time delivery rates, WhatsApp response times, and sales conversion funnels.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
              <span>WhatsApp Delivery</span>
              <Send className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 dark:text-white">98.4%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">2,398 / 2,430 delivered</p>
          </CardContent>
        </Card>

        <Card className="border-sky-100 bg-sky-50/20 dark:border-sky-950 dark:bg-sky-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-sky-700 uppercase tracking-wider dark:text-sky-300">
              <span>Email Open Rate</span>
              <Mail className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 dark:text-white">42.8%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">780 opens recorded</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/20 dark:border-purple-950 dark:bg-purple-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-700 uppercase tracking-wider dark:text-purple-300">
              <span>Avg. First Reply Time</span>
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 dark:text-white">12 Mins</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated instant replies</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/20 dark:border-indigo-950 dark:bg-indigo-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700 uppercase tracking-wider dark:text-indigo-300">
              <span>Lead Conversion</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 dark:text-white">18.6%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">+4.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Breakdown & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold">Customer Conversion Funnel</CardTitle>
            <CardDescription className="text-xs">Drop-off rates across each customer journey stage</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {[
              { stage: "Data Upload / Ingestion", count: "100%", sub: "1,240 Contacts", width: "w-full", color: "bg-indigo-600" },
              { stage: "Instant WhatsApp Delivered", count: "98%", sub: "1,218 Delivered", width: "w-[98%]", color: "bg-emerald-600" },
              { stage: "Customer Replied / Engaged", count: "64%", sub: "794 Responded", width: "w-[64%]", color: "bg-sky-600" },
              { stage: "Sales Call / Demo Qualified", count: "32%", sub: "396 Qualified", width: "w-[32%]", color: "bg-amber-600" },
              { stage: "Deal Won & Converted", count: "18%", sub: "228 Customers", width: "w-[18%]", color: "bg-purple-600" },
            ].map((f, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{f.stage}</span>
                  <span className="text-slate-500">{f.count} ({f.sub})</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div className={`h-full ${f.color} rounded-full ${f.width}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ingestion Sources */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold">Top Data Ingestion Channels</CardTitle>
            <CardDescription className="text-xs">Where contacts originate before entering workflows</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {[
              { source: "Excel & CSV Spreadsheets", percent: "52%", leads: "645 Leads", color: "text-indigo-600" },
              { source: "AI OCR Scanner (Screenshots & Cards)", percent: "24%", leads: "298 Leads", color: "text-purple-600" },
              { source: "Website Lead Forms & Webhooks", percent: "14%", leads: "174 Leads", color: "text-emerald-600" },
              { source: "WhatsApp Direct Inbound Messages", percent: "10%", leads: "123 Leads", color: "text-sky-600" },
            ].map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs dark:bg-slate-800/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100">{s.source}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{s.leads}</span>
                  <span className={`font-bold ${s.color}`}>{s.percent}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

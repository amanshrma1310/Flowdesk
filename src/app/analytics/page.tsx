"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Megaphone,
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

export default function AnalyticsReportsPage() {
  const { currentUser, leads, scopedLeads, campaigns, responses, users } = useFlowDesk();

  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + c.deliveredCount, 0);
  const totalPositive = responses.filter((r) => r.sentiment === "Positive").length;
  const totalNegative = responses.filter((r) => r.sentiment === "Negative").length;

  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;
  const positiveRate = responses.length > 0 ? Math.round((totalPositive / responses.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Marketing Reports & Analytics
          </h1>
          <Badge variant="purple" className="text-xs font-bold">
            Live Metrics
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Delivery status, response sentiment, and conversion performance (PDF Pages 4, 14, 17, 19).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Total Leads</span>
            <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">{scopedLeads.length}</p>
            <p className="text-[11px] text-slate-400">In current scope</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Delivery Rate</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{deliveryRate}%</p>
            <p className="text-[11px] text-slate-400">{totalDelivered} / {totalSent} Messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Positive Responses</span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{totalPositive}</p>
            <p className="text-[11px] text-slate-400">{positiveRate}% of all replies</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Negative / Opt-Out</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{totalNegative}</p>
            <p className="text-[11px] text-slate-400">Stopped automatically</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Breakdown Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Campaign Performance Breakdown</CardTitle>
          <CardDescription className="text-xs">
            Performance metrics per marketing blast and channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No campaigns run yet. Create a campaign to view delivery analytics.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold dark:bg-slate-900 dark:border-slate-800">
                  <th className="p-3 pl-4">Campaign</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Target List</th>
                  <th className="p-3">Sent</th>
                  <th className="p-3">Delivered</th>
                  <th className="p-3">Replies</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3 pl-4 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="p-3">
                      <Badge variant={c.channel === "WhatsApp" ? "success" : "default"} className="text-[10px]">
                        {c.channel}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{c.folderName}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.sentCount}</td>
                    <td className="p-3 font-semibold text-emerald-600">{c.deliveredCount}</td>
                    <td className="p-3 font-semibold text-purple-600">{c.repliedCount}</td>
                    <td className="p-3 pr-4">
                      <Badge variant="secondary" className="text-[10px]">{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

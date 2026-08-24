"use client";

import React, { useState } from "react";
import {
  Link2,
  Send,
  Mail,
  FileSpreadsheet,
  Webhook,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IntegrationsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Integrations & API Channels
          </h1>
          <Badge variant="success" className="text-xs font-bold">
            Official Meta Cloud API
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect your communication channels, spreadsheets, forms, and ad accounts.
        </p>
      </div>

      {/* Phase 1 Live Integrations */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Active Core Channels (Phase 1)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WhatsApp Official Cloud API */}
          <Card className="border-emerald-200 bg-emerald-50/20 dark:border-emerald-900 dark:bg-emerald-950/20">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span>WhatsApp Business Cloud API</span>
                      <Badge variant="success" className="text-[10px]">CONNECTED</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">Official Meta Platform & Templates</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Connected to Meta WABA ID <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] dark:bg-slate-800">waba_9918239012</code>. High delivery rate with official template approval.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Phone ID: +91 98765 00000</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">Configure Templates</Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactional Email */}
          <Card className="border-sky-200 bg-sky-50/20 dark:border-sky-900 dark:bg-sky-950/20">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span>Email / SMTP & Resend</span>
                      <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">With Open & Click Tracking Pixel</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Domain <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] dark:bg-slate-800">flowdesk.ai</code> verified with DKIM and SPF records for 99.8% inbox delivery.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Default Sender: aman@flowdesk.ai</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">Manage SMTP</Button>
              </div>
            </CardContent>
          </Card>

          {/* Inbound & Outbound Webhooks */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Webhook className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <span>Developer Webhooks & API</span>
                    <Badge variant="secondary" className="text-[10px]">ENABLED</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">Real-time HTTP Event Subscriptions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <p className="text-slate-500">
                Trigger external actions when contacts are created, deals are won, or messages are delivered.
              </p>
              <Button size="sm" variant="outline" className="h-7 text-xs">Manage Webhook Endpoints</Button>
            </CardContent>
          </Card>

          {/* Google Sheets Sync */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <span>Google Sheets 2-Way Sync</span>
                    <Badge variant="secondary" className="text-[10px]">CONFIGURED</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">Live Spreadsheet Ingestion</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <p className="text-slate-500">
                Automatically import new rows from shared Google Spreadsheets in real-time.
              </p>
              <Button size="sm" variant="outline" className="h-7 text-xs">Configure Sheet</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Phase 2 & 3 Connectors */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Ecosystem Connectors (Phase 2 & 3)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Meta Lead Ads", desc: "Facebook & Instagram Forms", status: "Coming Soon" },
            { name: "Shopify", desc: "Abandoned Cart Recovery", status: "Coming Soon" },
            { name: "WooCommerce / WP", desc: "Customer Checkout Sync", status: "Coming Soon" },
            { name: "Calendly / Cal.com", desc: "Demo Booking Triggers", status: "Coming Soon" },
          ].map((c, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 opacity-75 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 dark:text-slate-200">{c.name}</p>
                <Badge variant="secondary" className="text-[9px]">{c.status}</Badge>
              </div>
              <p className="text-[11px] text-slate-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

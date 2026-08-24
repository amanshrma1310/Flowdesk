"use client";

import React, { useState } from "react";
import {
  Settings,
  Key,
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  Sparkles,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText("fd_live_9988224411aabbee77");
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspace Settings & Subscription
          </h1>
          <Badge variant="purple" className="text-xs font-bold">
            Growth Plan Active
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage workspace settings, developer API keys, and subscription plan limits.
        </p>
      </div>

      {/* Workspace Details */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-600" />
            <span>Workspace Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3 max-w-md text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Organization Name
            </label>
            <Input defaultValue="FlowDesk AI Inc" className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Workspace Domain Slug
            </label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 border-slate-200 px-2.5 py-2 text-xs text-slate-500 rounded-l-lg dark:bg-slate-800 dark:border-slate-700">
                flowdesk.ai/
              </span>
              <Input defaultValue="leadspark" className="rounded-l-none text-xs" />
            </div>
          </div>
          <div className="pt-1">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Developer API Keys */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-600" />
            <span>Developer API Key</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Authenticate REST API requests to <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] dark:bg-slate-800">/api/v1/...</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono text-xs text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <span>fd_live_9988224411aabbee77********************</span>
            <Button size="sm" variant="outline" onClick={handleCopyKey} className="h-7 text-xs gap-1">
              {apiKeyCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{apiKeyCopied ? "Copied!" : "Copy Key"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hybrid Pricing Plans */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Subscription Plans & Pricing Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter */}
          <Card className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Starter</h4>
              <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">
                ₹1,499<span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">For solo entrepreneurs & small shops</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> 1 User seat</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> 2,000 Contacts</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Smart Excel & CSV Importer</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Basic Email Follow-ups</li>
            </ul>

            <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
              Downgrade
            </Button>
          </Card>

          {/* Growth (Active) */}
          <Card className="p-5 space-y-4 border-2 border-indigo-600 relative shadow-md bg-indigo-50/20 dark:bg-indigo-950/20">
            <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              CURRENT PLAN
            </span>

            <div>
              <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-200">Growth</h4>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ₹3,999<span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">For scaling sales & marketing teams</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> 5 User seats</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> 20,000 Contacts</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> Official WhatsApp Cloud API</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> Visual No-Code Automation Builder</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> AI OCR Scanner & Auto-Clean</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> Event & Webinar Journeys</li>
            </ul>

            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
              Active Plan
            </Button>
          </Card>

          {/* Business */}
          <Card className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Business</h4>
              <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">
                ₹9,999<span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">For high-volume multi-brand organizations</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> 15+ User seats</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> 100,000+ Contacts</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Advanced Round-Robin & Territory</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Full API & Webhooks Access</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> AI Natural Language Assistant</li>
            </ul>

            <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
              Upgrade to Business
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

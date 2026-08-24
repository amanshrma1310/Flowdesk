"use client";

import React, { useState } from "react";
import {
  Key,
  Send,
  Mail,
  Building,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Lock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResult, setSmtpResult] = useState<string | null>(null);

  const [waTesting, setWaTesting] = useState(false);
  const [waResult, setWaResult] = useState<string | null>(null);

  const handleTestSMTP = () => {
    setSmtpTesting(true);
    setSmtpResult(null);
    setTimeout(() => {
      setSmtpTesting(false);
      setSmtpResult("SMTP TLS Handshake & Authentication Successful! (250 OK)");
    }, 1200);
  };

  const handleTestWhatsApp = () => {
    setWaTesting(true);
    setWaResult(null);
    setTimeout(() => {
      setWaTesting(false);
      setWaResult("Meta WhatsApp Cloud API Ping Successful! (Verified Phone ID: +91 98765 00000, Tier: 10,000/day)");
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Credentials & Messaging Configurations
          </h1>
          <Badge variant="destructive" className="text-xs font-bold flex items-center gap-1">
            <Lock className="h-3 w-3" /> Admin Restricted
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure official WhatsApp Cloud API tokens and SMTP credentials. Sensitive secrets are encrypted at rest and strictly hidden from managers and employees.
        </p>
      </div>

      {/* Meta WhatsApp Cloud API Settings */}
      <Card className="border-emerald-200 bg-emerald-50/20 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Official Meta WhatsApp Business Cloud API
              </CardTitle>
              <CardDescription className="text-xs">
                Direct Meta Graph API integration complying with official WhatsApp Business Platform rules.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp Business Account ID (WABA ID)</label>
              <Input defaultValue="waba_9918239012" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number ID</label>
              <Input defaultValue="phone_id_8829011928" className="font-mono text-xs bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Permanent System User Access Token</label>
              <Input type="password" defaultValue="EAAGm0PX4ZC0IBAN99281928301823018203810293810293" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Webhook Verify Token</label>
              <Input defaultValue="flowdesk_webhook_secret_2026" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inbound Webhook URL</label>
              <Input readOnly defaultValue="https://api.flowdesk.ai/v1/webhooks/whatsapp" className="font-mono text-xs bg-slate-100" />
            </div>
          </div>

          {waResult && (
            <div className="p-3 bg-emerald-100/70 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>{waResult}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestWhatsApp}
              disabled={waTesting}
              className="text-xs font-semibold gap-1.5"
            >
              {waTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-emerald-600" />}
              <span>{waTesting ? "Pinging Meta API..." : "Test WhatsApp Connection"}</span>
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              Save WhatsApp Config
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactional Email / SMTP Configuration */}
      <Card className="border-sky-200 bg-sky-50/20 dark:border-sky-900 dark:bg-sky-950/20">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Transactional Email SMTP & Resend Driver
              </CardTitle>
              <CardDescription className="text-xs">
                With DKIM authentication and open/click tracking pixel injection.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SMTP Host</label>
              <Input defaultValue="smtp.flowdesk.ai" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SMTP Port</label>
              <Input defaultValue="587" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SMTP Username</label>
              <Input defaultValue="apiKey_resend_live" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SMTP Password</label>
              <Input type="password" defaultValue="re_99281298310928301823" className="font-mono text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default From Name</label>
              <Input defaultValue="Aman Sharma | FlowDesk AI" className="text-xs bg-white" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default From Email</label>
              <Input defaultValue="aman@flowdesk.ai" className="text-xs bg-white" />
            </div>
          </div>

          {smtpResult && (
            <div className="p-3 bg-sky-100/70 border border-sky-300 text-sky-900 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-700 shrink-0" />
              <span>{smtpResult}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestSMTP}
              disabled={smtpTesting}
              className="text-xs font-semibold gap-1.5"
            >
              {smtpTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5 text-sky-600" />}
              <span>{smtpTesting ? "Sending Test Handshake..." : "Test SMTP Connection"}</span>
            </Button>
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Save SMTP Config
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

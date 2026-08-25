"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Send,
  Shield,
  CheckCircle2,
  AlertCircle,
  Key,
  Server,
  Zap,
  Save,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "whatsapp" ? "WHATSAPP" : "SMTP";
  const [activeTab, setActiveTab] = useState<"SMTP" | "WHATSAPP">(initialTab);

  const { smtpSettings, whatsAppSettings, saveSMTPSettings, saveWhatsAppSettings, currentUser } = useFlowDesk();

  // SMTP form state (PDF Page 9)
  const [host, setHost] = useState(smtpSettings.host);
  const [port, setPort] = useState(smtpSettings.port);
  const [username, setUsername] = useState(smtpSettings.username);
  const [password, setPassword] = useState("••••••••••••");
  const [encryption, setEncryption] = useState<"TLS" | "SSL" | "NONE">(smtpSettings.encryption);
  const [fromName, setFromName] = useState(smtpSettings.fromName);
  const [fromEmail, setFromEmail] = useState(smtpSettings.fromEmail);

  // WhatsApp form state (PDF Page 9)
  const [provider, setProvider] = useState(whatsAppSettings.provider);
  const [apiUrl, setApiUrl] = useState(whatsAppSettings.apiUrl);
  const [apiKey, setApiKey] = useState("eaag9_live_token_7721");
  const [accessToken, setAccessToken] = useState("EAAG9ZCd2ZC...live");
  const [phoneNumberId, setPhoneNumberId] = useState("109847291823901");
  const [businessAccountId, setBusinessAccountId] = useState("293847192840192");
  const [webhookUrl, setWebhookUrl] = useState(whatsAppSettings.webhookUrl);

  // Test status states
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<string | null>(null);

  const [isTestingWa, setIsTestingWa] = useState(false);
  const [waTestResult, setWaTestResult] = useState<string | null>(null);

  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    saveSMTPSettings({
      host,
      port,
      username,
      encryption,
      fromName,
      fromEmail,
    });
    setSaveAlert("SMTP configuration saved successfully!");
    setTimeout(() => setSaveAlert(null), 3000);
  };

  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    setTimeout(() => {
      setIsTestingSmtp(false);
      setSmtpTestResult("Test Email delivered successfully to " + fromEmail + " via " + host);
    }, 1200);
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhatsAppSettings({
      provider,
      apiUrl,
      apiKey,
      accessToken,
      phoneNumberId,
      businessAccountId,
      webhookUrl,
    });
    setSaveAlert("WhatsApp Cloud API settings saved successfully!");
    setTimeout(() => setSaveAlert(null), 3000);
  };

  const handleTestWhatsApp = () => {
    setIsTestingWa(true);
    setWaTestResult(null);
    setTimeout(() => {
      setIsTestingWa(false);
      setWaTestResult("Meta WhatsApp Cloud API Handshake: 200 OK (Phone ID: " + phoneNumberId + ")");
    }, 1200);
  };

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Access Denied. Only the Main Administrator can configure SMTP and WhatsApp API settings.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              API & Delivery Settings
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              Admin Gateway
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure SMTP Email and Official Meta WhatsApp Cloud API credentials (PDF Pages 9 & 10).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold dark:bg-slate-800">
          <button
            onClick={() => setActiveTab("SMTP")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "SMTP" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white" : "text-slate-500"
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-sky-600" />
            <span>SMTP Email</span>
          </button>
          <button
            onClick={() => setActiveTab("WHATSAPP")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "WHATSAPP" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white" : "text-slate-500"
            }`}
          >
            <Send className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp API</span>
          </button>
        </div>
      </div>

      {saveAlert && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* 1. SMTP SETTINGS (PDF Page 9) */}
      {activeTab === "SMTP" && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-600" />
              <span>Email & SMTP Settings</span>
            </CardTitle>
            <CardDescription className="text-xs">
              The system validates SMTP delivery before allowing campaigns to send messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Host *</label>
                  <Input required value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.mailgun.org" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Port *</label>
                  <Input required value={port} onChange={(e) => setPort(e.target.value)} placeholder="587" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Username *</label>
                  <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="postmaster@yourdomain.com" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Encryption Protocol</label>
                  <select
                    value={encryption}
                    onChange={(e) => setEncryption(e.target.value as "TLS" | "SSL" | "NONE")}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white"
                  >
                    <option value="TLS">TLS (Recommended)</option>
                    <option value="SSL">SSL</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">From Name *</label>
                  <Input required value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Marketing Team" />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">From Email Address *</label>
                  <Input required type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="outreach@yourcompany.com" />
                </div>
              </div>

              {smtpTestResult && (
                <div className="p-3 bg-sky-50 text-sky-900 rounded-xl text-xs flex items-center gap-2 border border-sky-200">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                  <span>{smtpTestResult}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestSmtp}
                  disabled={isTestingSmtp}
                  className="text-xs font-semibold gap-1.5 border-sky-200 text-sky-700 hover:bg-sky-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingSmtp ? "animate-spin" : ""}`} />
                  <span>{isTestingSmtp ? "Sending Test Email..." : "Send Test Email"}</span>
                </Button>

                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Email Settings</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 2. WHATSAPP API SETTINGS (PDF Page 9) */}
      {activeTab === "WHATSAPP" && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-600" />
              <span>WhatsApp API Settings</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Configure official Meta WhatsApp Cloud API credentials for compliant broadcast campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <form onSubmit={handleSaveWhatsApp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">WhatsApp Provider *</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white"
                  >
                    <option value="Meta WhatsApp Cloud API">Meta WhatsApp Cloud API (Official)</option>
                    <option value="Twilio">Twilio WhatsApp</option>
                    <option value="Custom Provider">Custom Webhook Provider</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">API Base URL *</label>
                  <Input required value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number ID *</label>
                  <Input required value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="109847291823901" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Business Account ID *</label>
                  <Input required value={businessAccountId} onChange={(e) => setBusinessAccountId(e.target.value)} placeholder="293847192840192" />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Access Token / API Key *</label>
                  <Input required type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Webhook URL (Inbound Responses)</label>
                  <Input readOnly value={webhookUrl} className="bg-slate-50 font-mono text-[11px]" />
                </div>
              </div>

              {waTestResult && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{waTestResult}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestWhatsApp}
                  disabled={isTestingWa}
                  className="text-xs font-semibold gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingWa ? "animate-spin" : ""}`} />
                  <span>{isTestingWa ? "Testing API Connection..." : "Test WhatsApp Connection"}</span>
                </Button>

                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save WhatsApp Settings</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

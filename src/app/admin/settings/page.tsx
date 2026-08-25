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
  Info,
  Phone,
  Eye,
  EyeOff,
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

  const {
    smtpSettings,
    whatsAppSettings,
    saveSMTPSettings,
    saveWhatsAppSettings,
    sendRealEmail,
    sendRealWhatsApp,
    currentUser,
  } = useFlowDesk();

  // SMTP form state
  const [host, setHost] = useState(smtpSettings.host || "smtp.gmail.com");
  const [port, setPort] = useState(smtpSettings.port || "587");
  const [username, setUsername] = useState(smtpSettings.username || "");
  const [password, setPassword] = useState(smtpSettings.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [encryption, setEncryption] = useState<"TLS" | "SSL" | "NONE">(smtpSettings.encryption || "TLS");
  const [fromName, setFromName] = useState(smtpSettings.fromName || "FlowDesk Marketing");
  const [fromEmail, setFromEmail] = useState(smtpSettings.fromEmail || "");
  const [testRecipientEmail, setTestRecipientEmail] = useState(currentUser?.email || smtpSettings.fromEmail || "");

  // WhatsApp form state
  const [provider, setProvider] = useState(whatsAppSettings.provider || "Meta WhatsApp Cloud API");
  const [apiUrl, setApiUrl] = useState(whatsAppSettings.apiUrl || "https://graph.facebook.com/v20.0");
  const [apiKey, setApiKey] = useState(whatsAppSettings.apiKey || "");
  const [accessToken, setAccessToken] = useState(whatsAppSettings.accessToken || "");
  const [phoneNumberId, setPhoneNumberId] = useState(whatsAppSettings.phoneNumberId || "");
  const [businessAccountId, setBusinessAccountId] = useState(whatsAppSettings.businessAccountId || "");
  const [webhookUrl, setWebhookUrl] = useState(whatsAppSettings.webhookUrl || "https://api.flowdesk.ai/webhooks/whatsapp");
  const [testWaPhone, setTestWaPhone] = useState(currentUser?.phone || "+91");

  // Test status states
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestSuccess, setSmtpTestSuccess] = useState<string | null>(null);
  const [smtpTestError, setSmtpTestError] = useState<string | null>(null);

  const [isTestingWa, setIsTestingWa] = useState(false);
  const [waTestSuccess, setWaTestSuccess] = useState<string | null>(null);
  const [waTestError, setWaTestError] = useState<string | null>(null);

  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    saveSMTPSettings({
      host: host.trim(),
      port: port.trim(),
      username: username.trim(),
      password: password.trim(),
      encryption,
      fromName: fromName.trim(),
      fromEmail: fromEmail.trim(),
    });
    setSaveAlert("SMTP Email configuration saved successfully!");
    setTimeout(() => setSaveAlert(null), 3000);
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhatsAppSettings({
      provider,
      apiUrl: apiUrl.trim(),
      apiKey: apiKey.trim(),
      accessToken: accessToken.trim(),
      phoneNumberId: phoneNumberId.trim(),
      businessAccountId: businessAccountId.trim(),
      webhookUrl: webhookUrl.trim(),
    });
    setSaveAlert("WhatsApp Cloud API settings saved successfully!");
    setTimeout(() => setSaveAlert(null), 3000);
  };

  // REAL LIVE SMTP TEST DISPATCH
  const handleTestSmtp = async () => {
    setSmtpTestSuccess(null);
    setSmtpTestError(null);

    if (!host.trim() || !username.trim()) {
      setSmtpTestError("Please enter SMTP Host and Username before testing.");
      return;
    }

    const targetEmail = testRecipientEmail.trim() || fromEmail.trim() || username.trim();
    if (!targetEmail) {
      setSmtpTestError("Please enter a recipient test email address.");
      return;
    }

    setIsTestingSmtp(true);

    const customSmtp = {
      host: host.trim(),
      port: port.trim(),
      username: username.trim(),
      password: password.trim(),
      encryption,
      fromName: fromName.trim(),
      fromEmail: fromEmail.trim() || username.trim(),
      isConfigured: true,
    };

    const res = await sendRealEmail({
      to: targetEmail,
      subject: `[FlowDesk AI] Real SMTP Test Email to ${targetEmail}`,
      text: `Hello ${fromName || "User"}!\n\nThis is a verified test email from FlowDesk AI confirming that your SMTP server (${host}:${port}) is working.\n\nSent at: ${new Date().toLocaleString()}\nHost: ${host}\nUsername: ${username}`,
      customSmtp,
    });

    setIsTestingSmtp(false);

    if (res.success) {
      saveSMTPSettings(customSmtp);
      setSmtpTestSuccess(res.message);
    } else {
      setSmtpTestError(res.message);
    }
  };

  // REAL LIVE WHATSAPP TEST DISPATCH
  const handleTestWhatsApp = async () => {
    setWaTestSuccess(null);
    setWaTestError(null);

    if (!phoneNumberId.trim() || !accessToken.trim()) {
      setWaTestError("Please enter your Phone Number ID and Access Token before testing.");
      return;
    }

    if (!testWaPhone.trim() || testWaPhone.replace(/[^0-9]/g, "").length < 10) {
      setWaTestError("Please enter a valid recipient WhatsApp phone number with country code (e.g. +91 98765 43210).");
      return;
    }

    setIsTestingWa(true);

    const customWa = {
      provider,
      apiUrl: apiUrl.trim(),
      apiKey: apiKey.trim(),
      accessToken: accessToken.trim(),
      phoneNumberId: phoneNumberId.trim(),
      businessAccountId: businessAccountId.trim(),
      webhookUrl: webhookUrl.trim(),
      isConfigured: true,
    };

    const res = await sendRealWhatsApp({
      to: testWaPhone.trim(),
      message: `Hello! This is a verified test message from FlowDesk AI confirming your Meta WhatsApp Cloud API integration is live.\n\nTimestamp: ${new Date().toLocaleString()}`,
      customSettings: customWa,
    });

    setIsTestingWa(false);

    if (res.success) {
      saveWhatsAppSettings(customWa);
      setWaTestSuccess(res.message);
    } else {
      setWaTestError(res.message);
    }
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
            Configure real live SMTP Email and official Meta WhatsApp Cloud API credentials.
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

      {/* 1. SMTP SETTINGS (LIVE NODEMAILER GATEWAY) */}
      {activeTab === "SMTP" && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-600" />
              <span>Real SMTP Email Delivery Gateway</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Connect your Gmail, Outlook, Amazon SES, SendGrid, or custom SMTP server to send live outreach & user onboarding emails.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            {/* Quick Gmail / Service Info Banner */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1.5 text-indigo-950 mb-4 dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-200">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Important Tip for Gmail Users (`smtp.gmail.com`):</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                1. <strong>SMTP Host</strong>: `smtp.gmail.com` • <strong>Port</strong>: `587` (TLS) or `465` (SSL).<br />
                2. <strong>Password</strong>: Google requires a <strong>16-character App Password</strong> (not your regular Gmail password).<br />
                ➔ Generate one at: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">Google Account &gt; Security &gt; 2-Step Verification &gt; App passwords</a>.
              </p>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Host *</label>
                  <Input required value={host} onChange={(e) => setHost(e.target.value)} placeholder="e.g. smtp.gmail.com" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Port *</label>
                  <Input required value={port} onChange={(e) => setPort(e.target.value)} placeholder="587 (TLS) or 465 (SSL)" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Username / Email *</label>
                  <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. amanshrma22583@gmail.com" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMTP Password / App Password *</label>
                  <div className="relative">
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="16-character App Password"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Encryption Protocol</label>
                  <select
                    value={encryption}
                    onChange={(e) => setEncryption(e.target.value as "TLS" | "SSL" | "NONE")}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
                  >
                    <option value="TLS">TLS (Port 587 - Recommended)</option>
                    <option value="SSL">SSL (Port 465)</option>
                    <option value="NONE">None (Port 25)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">From Name *</label>
                  <Input required value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="e.g. Aman Sharma" />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">From Email Address *</label>
                  <Input required type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="e.g. amanshrma22583@gmail.com" />
                </div>
              </div>

              {/* Real Test Email Panel */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <label className="font-bold text-slate-800 block text-xs dark:text-slate-200">
                  Send Live Test Email to Inbox:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="Enter recipient email (e.g. your own email)"
                    value={testRecipientEmail}
                    onChange={(e) => setTestRecipientEmail(e.target.value)}
                    className="bg-white text-xs dark:bg-slate-900"
                  />
                  <Button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={isTestingSmtp}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isTestingSmtp ? "animate-spin" : ""}`} />
                    <span>{isTestingSmtp ? "Transmitting Email..." : "Send Real Test Email"}</span>
                  </Button>
                </div>

                {smtpTestSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{smtpTestSuccess}</span>
                  </div>
                )}

                {smtpTestError && (
                  <div className="p-3 bg-rose-50 text-rose-900 rounded-xl text-xs flex items-start gap-2 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">SMTP Delivery Failed:</p>
                      <p className="text-[11px] font-mono leading-relaxed">{smtpTestError}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Email Settings</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 2. WHATSAPP API SETTINGS (LIVE META CLOUD API GATEWAY) */}
      {activeTab === "WHATSAPP" && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-600" />
              <span>Official Meta WhatsApp Cloud API Gateway</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Configure official Meta Graph API credentials for live automated WhatsApp follow-ups & broadcasting.
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
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white dark:bg-slate-950"
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
                  <Input required value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="e.g. 109847291823901" />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">WhatsApp Business Account ID *</label>
                  <Input required value={businessAccountId} onChange={(e) => setBusinessAccountId(e.target.value)} placeholder="e.g. 293847192840192" />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Permanent Access Token (Bearer) *</label>
                  <Input required type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAG9ZCd2ZC..." />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Webhook URL (For Inbound Customer Responses)</label>
                  <Input readOnly value={webhookUrl} className="bg-slate-50 font-mono text-[11px] dark:bg-slate-900" />
                </div>
              </div>

              {/* Real Test WhatsApp Panel */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <label className="font-bold text-slate-800 block text-xs dark:text-slate-200">
                  Send Live Test WhatsApp Message:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Phone className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="Recipient phone with country code (e.g. +91 98765 43210)"
                      value={testWaPhone}
                      onChange={(e) => setTestWaPhone(e.target.value)}
                      className="pl-9 bg-white text-xs dark:bg-slate-900"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleTestWhatsApp}
                    disabled={isTestingWa}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isTestingWa ? "animate-spin" : ""}`} />
                    <span>{isTestingWa ? "Sending Message..." : "Send Test WhatsApp"}</span>
                  </Button>
                </div>

                {waTestSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{waTestSuccess}</span>
                  </div>
                )}

                {waTestError && (
                  <div className="p-3 bg-rose-50 text-rose-900 rounded-xl text-xs flex items-start gap-2 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">WhatsApp Dispatch Failed:</p>
                      <p className="text-[11px] font-mono leading-relaxed">{waTestError}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
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

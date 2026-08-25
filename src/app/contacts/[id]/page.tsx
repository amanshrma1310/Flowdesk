"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Send,
  Building,
  Phone,
  Globe,
  Clock,
  CheckCircle2,
  Zap,
  FolderKanban,
  User,
  Plus,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";
import { LeadStatus } from "@/lib/types";

const ALL_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Interested",
  "Not Interested",
  "Positive",
  "Negative",
  "Converted",
  "Unresponsive",
  "Unsubscribed",
  "Blocked",
];

export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const {
    leads,
    workflows,
    templates,
    updateLeadStatus,
    addLeadActivity,
    addLeadToWorkflow,
    recordResponse,
    currentUser,
  } = useFlowDesk();

  const lead = leads.find((l) => l.id === leadId) || leads[0];

  // Quick Action Drawer
  const [activeAction, setActiveAction] = useState<"NONE" | "EMAIL" | "WHATSAPP" | "WORKFLOW" | "RESPONSE">("NONE");
  const [emailSubject, setEmailSubject] = useState(`Next Steps for ${lead?.company || "Your Business"}`);
  const [emailBody, setEmailBody] = useState(`Hello ${lead?.name?.split(" ")[0] || "there"},\n\nWe wanted to share our solution with you.`);
  const [whatsAppMsg, setWhatsAppMsg] = useState(`Hi ${lead?.name?.split(" ")[0] || "there"} 👋 We have a special growth solution for ${lead?.company || "you"}. Would you like to know more?\n\nReply:\n1 - Yes\n2 - No`);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || "");
  const [incomingResponseMsg, setIncomingResponseMsg] = useState("Yes, I am interested! Please share more details.");
  const [responseSentiment, setResponseSentiment] = useState<"Positive" | "Negative" | "Question">("Positive");

  if (!lead) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-slate-500 text-xs">No lead found.</p>
        <Link href="/contacts">
          <Button size="sm" variant="outline">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  const handleSendEmail = () => {
    if (!emailBody.trim()) return;
    addLeadActivity(lead.id, {
      action: `Email Sent: ${emailSubject}`,
      channel: "Email",
      details: emailBody.slice(0, 100) + "...",
      actor: currentUser?.name || "System",
    });
    updateLeadStatus(lead.id, "Contacted");
    setActiveAction("NONE");
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppMsg.trim()) return;
    addLeadActivity(lead.id, {
      action: "WhatsApp Message Sent",
      channel: "WhatsApp",
      details: whatsAppMsg.slice(0, 100) + "...",
      actor: currentUser?.name || "System",
    });
    updateLeadStatus(lead.id, "Contacted");
    setActiveAction("NONE");
  };

  const handleEnrollWorkflow = () => {
    if (!selectedWorkflowId) return;
    addLeadToWorkflow(lead.id, selectedWorkflowId);
    setActiveAction("NONE");
  };

  const handleSimulateResponse = () => {
    if (!incomingResponseMsg.trim()) return;
    recordResponse(lead.id, incomingResponseMsg, responseSentiment, "WhatsApp");
    setActiveAction("NONE");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => router.push("/contacts")}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Leads</span>
      </button>

      {/* Main Profile Card */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/30 via-white to-purple-50/20 dark:from-indigo-950/20 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
                {lead.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {lead.name}
                  </h1>
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                    className="text-xs font-bold rounded-md px-2 py-1 bg-white border border-slate-200 shadow-2xs dark:bg-slate-800"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                  {lead.company && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {lead.company}
                    </span>
                  )}
                  {lead.folderName && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <FolderKanban className="h-3 w-3 text-slate-400" />
                      {lead.folderName}
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-4 pt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    {lead.whatsApp || lead.phone || "No phone"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {lead.email || "No email"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setActiveAction(activeAction === "WHATSAPP" ? "NONE" : "WHATSAPP")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send WhatsApp</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveAction(activeAction === "EMAIL" ? "NONE" : "EMAIL")}
                className="text-xs font-bold gap-1.5 border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Send Email</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveAction(activeAction === "WORKFLOW" ? "NONE" : "WORKFLOW")}
                className="text-xs font-bold gap-1.5 border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Add to Workflow</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveAction(activeAction === "RESPONSE" ? "NONE" : "RESPONSE")}
                className="text-xs font-semibold gap-1 text-slate-500"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Simulate Reply</span>
              </Button>
            </div>
          </div>

          {/* Quick Action Drawer Form */}
          {activeAction !== "NONE" && (
            <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in">
              {activeAction === "WHATSAPP" && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Send WhatsApp Marketing Message</span>
                  </p>
                  <textarea
                    value={whatsAppMsg}
                    onChange={(e) => setWhatsAppMsg(e.target.value)}
                    className="w-full h-24 p-2.5 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-950"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleSendWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      Send WhatsApp Now
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "EMAIL" && (
                <div className="space-y-2 text-xs">
                  <Input
                    placeholder="Email Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full h-24 p-2.5 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-950"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleSendEmail} className="bg-sky-600 hover:bg-sky-700 text-white font-bold">
                      Send Email Now
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "WORKFLOW" && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Enroll in Automated Sequence:
                  </p>
                  <select
                    value={selectedWorkflowId}
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-3 bg-white"
                  >
                    {workflows.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.steps.length} Steps)</option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleEnrollWorkflow} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                      Confirm Enrollment
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "RESPONSE" && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Simulate Customer Inbound Response (PDF Page 12 Response-Based Automation):
                  </p>
                  <Input
                    value={incomingResponseMsg}
                    onChange={(e) => setIncomingResponseMsg(e.target.value)}
                    placeholder="Customer message text..."
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <label className="font-semibold text-slate-600">Response Sentiment:</label>
                    <button
                      type="button"
                      onClick={() => setResponseSentiment("Positive")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${responseSentiment === "Positive" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      Positive (Interested)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponseSentiment("Negative")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${responseSentiment === "Negative" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      Negative (Not Interested)
                    </button>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleSimulateResponse} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      Trigger Response Flow
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Details & Lead Activity Timeline (PDF Page 14) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Lead Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Employee</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{lead.assignedEmployeeName}</p>
                {lead.managerName && <p className="text-[10px] text-slate-400">Pod Mgr: {lead.managerName}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lead Source</span>
                <p className="font-semibold text-indigo-600 mt-0.5">{lead.source}</p>
              </div>

              {lead.notes && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Notes</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    {lead.notes}
                  </p>
                </div>
              )}

              {lead.activeWorkflowName && (
                <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Active Workflow
                  </span>
                  <p className="font-bold text-purple-900 text-xs">{lead.activeWorkflowName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Lead Activity Timeline (PDF Page 14) */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>Lead Activity Timeline</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Complete chronological activity history for this lead.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                {lead.activities?.map((act) => (
                  <div key={act.id} className="relative group">
                    <div
                      className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] shadow-xs ${
                        act.channel === "WhatsApp"
                          ? "bg-emerald-600"
                          : act.channel === "Email"
                          ? "bg-sky-600"
                          : act.channel === "Workflow"
                          ? "bg-purple-600"
                          : "bg-indigo-600"
                      }`}
                    >
                      {act.channel === "WhatsApp" ? (
                        <Send className="h-2.5 w-2.5" />
                      ) : act.channel === "Email" ? (
                        <Mail className="h-2.5 w-2.5" />
                      ) : (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1 dark:bg-slate-800/60 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{act.timestamp}</span>
                      </div>
                      {act.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {act.details}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">Actor: <strong>{act.actor}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

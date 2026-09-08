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
  Camera,
  Download,
  Eye,
  X,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { LeadStatus } from "@/lib/types";
import { LeadPhotoCapture } from "@/components/leads/LeadPhotoCapture";

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
    updateLead,
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

  // Photo Management Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>("");
  const [capturedPhotoType, setCapturedPhotoType] = useState<"card" | "person" | "document">("card");

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

  const handleSimulateReply = () => {
    if (!incomingResponseMsg.trim()) return;
    recordResponse(lead.id, incomingResponseMsg, responseSentiment, "WhatsApp");
    setActiveAction("NONE");
  };

  const handleSavePhoto = () => {
    if (!capturedPhotoUrl) return;
    updateLead(lead.id, {
      photoUrl: capturedPhotoUrl,
      photoType: capturedPhotoType,
    });
    addLeadActivity(lead.id, {
      action: "Photo / Card Updated",
      channel: "System",
      details: `${capturedPhotoType === "card" ? "Business card" : "Photo"} attached to contact profile`,
      actor: currentUser?.name || "User",
    });
    setIsPhotoModalOpen(false);
  };

  const handleRemovePhoto = () => {
    updateLead(lead.id, {
      photoUrl: undefined,
      photoType: undefined,
    });
    addLeadActivity(lead.id, {
      action: "Photo Removed",
      channel: "System",
      details: `Lead photo removed by ${currentUser?.name || "User"}`,
      actor: currentUser?.name || "User",
    });
    setCapturedPhotoUrl("");
    setIsPhotoModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/contacts")}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Leads</span>
      </button>

      {/* Main Profile Card */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/30 via-white to-purple-50/20 dark:from-indigo-950/20 dark:to-slate-900">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Photo or Initials Avatar */}
              {lead.photoUrl ? (
                <div className="relative group shrink-0">
                  <img
                    src={lead.photoUrl}
                    alt={lead.name}
                    onClick={() => setIsLightboxOpen(true)}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm cursor-pointer group-hover:scale-105 transition-transform"
                  />
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center cursor-pointer transition-opacity"
                  >
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <button
                    onClick={() => {
                      setCapturedPhotoUrl(lead.photoUrl || "");
                      setIsPhotoModalOpen(true);
                    }}
                    title="Change Photo"
                    className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-200 shadow-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative group shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <button
                    onClick={() => {
                      setCapturedPhotoUrl("");
                      setIsPhotoModalOpen(true);
                    }}
                    title="Snap or Attach Photo"
                    className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1.5 border border-slate-200 shadow-xs text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
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

                <div className="flex items-center gap-4 pt-1 font-mono text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                  {lead.whatsApp || lead.phone ? (
                    <a
                      href={`tel:${lead.phone || lead.whatsApp}`}
                      className="flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {lead.whatsApp || lead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">No phone</span>
                  )}

                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1 hover:text-indigo-600"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">No email</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setActiveAction(activeAction === "WHATSAPP" ? "NONE" : "WHATSAPP")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send WhatsApp</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveAction(activeAction === "EMAIL" ? "NONE" : "EMAIL")}
                className="text-xs font-bold gap-1.5 border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100 cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Send Email</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCapturedPhotoUrl(lead.photoUrl || "");
                  setIsPhotoModalOpen(true);
                }}
                className="text-xs font-bold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{lead.photoUrl ? "Update Photo" : "Snap Photo"}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveAction(activeAction === "WORKFLOW" ? "NONE" : "WORKFLOW")}
                className="text-xs font-bold gap-1.5 border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Workflow</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveAction(activeAction === "RESPONSE" ? "NONE" : "RESPONSE")}
                className="text-xs font-semibold gap-1 text-slate-500 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Simulate Reply</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTION DRAWER */}
      {activeAction === "EMAIL" && (
        <Card className="border-sky-200 bg-sky-50/40 dark:bg-slate-900 animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
                <Mail className="h-4 w-4 text-sky-600" />
                <span>Send One-off Email to {lead.email || lead.name}</span>
              </div>
              <button onClick={() => setActiveAction("NONE")} className="text-slate-400 hover:text-slate-700">✕</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="bg-white text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Message</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-950"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveAction("NONE")}>Cancel</Button>
              <Button size="sm" onClick={handleSendEmail} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeAction === "WHATSAPP" && (
        <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-slate-900 animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <Send className="h-4 w-4 text-emerald-600" />
                <span>Send WhatsApp Message to {lead.whatsApp || lead.phone || lead.name}</span>
              </div>
              <button onClick={() => setActiveAction("NONE")} className="text-slate-400 hover:text-slate-700">✕</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp Text</label>
              <textarea
                value={whatsAppMsg}
                onChange={(e) => setWhatsAppMsg(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-950"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveAction("NONE")}>Cancel</Button>
              <Button size="sm" onClick={handleSendWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Send WhatsApp Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeAction === "WORKFLOW" && (
        <Card className="border-purple-200 bg-purple-50/40 dark:bg-slate-900 animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Enroll in Follow-up Sequence</span>
              </div>
              <button onClick={() => setActiveAction("NONE")} className="text-slate-400 hover:text-slate-700">✕</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Workflow</label>
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="w-full h-9 rounded-lg border border-purple-200 bg-white text-xs px-2.5"
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>{wf.name} ({wf.steps.length} Steps)</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveAction("NONE")}>Cancel</Button>
              <Button size="sm" onClick={handleEnrollWorkflow} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Enroll Lead Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeAction === "RESPONSE" && (
        <Card className="border-amber-200 bg-amber-50/40 dark:bg-slate-900 animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <MessageSquare className="h-4 w-4 text-amber-600" />
                <span>Simulate Incoming Customer Message</span>
              </div>
              <button onClick={() => setActiveAction("NONE")} className="text-slate-400 hover:text-slate-700">✕</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message Body</label>
              <Input value={incomingResponseMsg} onChange={(e) => setIncomingResponseMsg(e.target.value)} className="bg-white text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Sentiment Classification</label>
              <div className="flex gap-2">
                {(["Positive", "Negative", "Question"] as const).map((sent) => (
                  <button
                    key={sent}
                    type="button"
                    onClick={() => setResponseSentiment(sent)}
                    className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                      responseSentiment === sent
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {sent}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveAction("NONE")}>Cancel</Button>
              <Button size="sm" onClick={handleSimulateReply} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                Simulate Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid: Details vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Info & Photo Box */}
        <div className="space-y-6">
          {/* Photo & Card Preview Card */}
          {lead.photoUrl ? (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Attached Photo / Card</span>
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Expand</span>
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative shadow-2xs"
                >
                  <img
                    src={lead.photoUrl}
                    alt={lead.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-2 py-1 bg-black/60 text-white text-xs font-bold rounded-lg backdrop-blur-xs">
                      View Full Size
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Type: <strong className="text-slate-700 dark:text-slate-300 capitalize">{lead.photoType || "Card"}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setCapturedPhotoUrl(lead.photoUrl || "");
                      setIsPhotoModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Replace Photo
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 text-center space-y-2">
                <Camera className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No Photo or Card Attached
                </p>
                <p className="text-[11px] text-slate-400">
                  Click below to take a picture with your webcam/phone camera or upload a business card image.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setCapturedPhotoUrl("");
                    setIsPhotoModalOpen(true);
                  }}
                  className="text-xs bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Snap / Upload Photo</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Details Card */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Company</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{lead.company || "Not specified"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">WhatsApp / Phone</span>
                <p className="font-mono text-emerald-600 font-semibold">{lead.whatsApp || lead.phone || "Not specified"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Email</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">{lead.email || "Not specified"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Source</span>
                <p className="text-slate-700 dark:text-slate-300">{lead.source}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Assigned Team Member</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{lead.assignedEmployeeName}</p>
                {lead.managerName && <p className="text-[11px] text-slate-400">Manager: {lead.managerName}</p>}
              </div>

              {lead.notes && (
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Notes</span>
                  <p className="text-slate-600 dark:text-slate-300 italic">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline of Activities */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>Activity & Communication Timeline</span>
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

      {/* PHOTO CAPTURE & UPLOAD MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-600" />
              <span>{lead.photoUrl ? "Update Photo / Card" : "Snap or Upload Photo"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Click a picture using your camera, flip front/back on mobile, or upload a photo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <LeadPhotoCapture
              currentPhotoUrl={capturedPhotoUrl}
              onPhotoCaptured={(url) => setCapturedPhotoUrl(url)}
              onRemovePhoto={() => setCapturedPhotoUrl("")}
            />

            <DialogFooter className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {lead.photoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemovePhoto}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Delete Current Photo
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!capturedPhotoUrl}
                  onClick={handleSavePhoto}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Photo
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* FULL LIGHTBOX PREVIEW MODAL */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>{lead.name}&apos;s Photo / Business Card</span>
              <Badge variant="purple" className="text-xs">
                {lead.photoType === "card" ? "Business Card" : "Lead Photo"}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Attached to {lead.name} ({lead.company || "Individual"})
            </DialogDescription>
          </DialogHeader>

          {lead.photoUrl && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center max-h-[65vh]">
                <img
                  src={lead.photoUrl}
                  alt={lead.name}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between">
                <a
                  href={lead.photoUrl}
                  download={`${lead.name.replace(/\s+/g, "_")}_photo.png`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Full Image</span>
                </a>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsLightboxOpen(false);
                      setCapturedPhotoUrl(lead.photoUrl || "");
                      setIsPhotoModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsLightboxOpen(false)}
                    className="text-xs bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

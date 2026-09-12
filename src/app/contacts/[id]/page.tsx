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
  AlertCircle,
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { LeadStatus, Lead } from "@/lib/types";
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
    deleteLead,
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

  // AI OCR Scanning & Editing State
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrAlert, setOcrAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingExtractedFields, setPendingExtractedFields] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    whatsApp: "",
    website: "",
    status: "New" as LeadStatus,
    notes: "",
  });

  const handleDeleteLead = () => {
    deleteLead(lead.id);
    router.push("/contacts");
  };

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

  const handleAutoExtractFromPhoto = async (targetPhotoUrl?: string) => {
    const photoToScan = targetPhotoUrl || lead.photoUrl;
    if (!photoToScan) {
      setOcrAlert({ type: "error", message: "No photo or business card attached to scan." });
      return;
    }

    setIsScanningOCR(true);
    setOcrAlert(null);

    try {
      const res = await fetch("/api/v1/ocr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photoToScan }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const { name, company, phone, whatsApp, email, notes, title, address, website } = json.data;

        const updates: Partial<Lead> = {};
        if (name && name.trim().length >= 2) {
          updates.name = name.trim();
        }
        if (company) updates.company = company.trim();
        if (phone) updates.phone = phone.trim();
        if (whatsApp) updates.whatsApp = whatsApp.trim();
        if (email) updates.email = email.trim();
        if (website) updates.website = website.trim();

        const extraNotesParts: string[] = [];
        if (title) extraNotesParts.push(`Designation: ${title}`);
        if (address) extraNotesParts.push(`Address: ${address}`);
        if (website) extraNotesParts.push(`Website: ${website}`);
        if (extraNotesParts.length > 0) {
          updates.notes = lead.notes ? `${lead.notes}\n${extraNotesParts.join("\n")}` : extraNotesParts.join("\n");
        }

        updateLead(lead.id, updates);

        addLeadActivity(lead.id, {
          action: "AI OCR Auto-Extraction Completed",
          channel: "System",
          details: `Card parsed: Name: ${name || lead.name}, Company: ${company || "N/A"}, Phone: ${whatsApp || phone || "N/A"}, Email: ${email || "N/A"}`,
          actor: currentUser?.name || "AI OCR Engine",
        });

        // Sync with server API
        try {
          await fetch("/api/v1/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...lead,
              ...updates,
              id: lead.id,
              agencyId: currentUser?.role,
            }),
          });
        } catch (err) {
          console.warn("API sync error:", err);
        }

        setOcrAlert({
          type: "success",
          message: `Card details extracted successfully! Populated Name: "${name || lead.name}", Company: "${company || "N/A"}", Phone: "${whatsApp || phone || "N/A"}", Email: "${email || "N/A"}"`,
        });
      } else {
        setOcrAlert({
          type: "error",
          message: json.error || "Could not detect clear text on this image. You can edit details manually using the Edit button.",
        });
      }
    } catch (err: any) {
      console.error("OCR Auto-extraction error:", err);
      setOcrAlert({
        type: "error",
        message: err.message || "Failed to scan photo. Please check your connection and try again.",
      });
    } finally {
      setIsScanningOCR(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: lead.name,
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || lead.whatsApp || "",
      whatsApp: lead.whatsApp || lead.phone || "",
      website: lead.website || "",
      status: lead.status,
      notes: lead.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<Lead> = {
      name: editFormData.name.trim() || lead.name,
      company: editFormData.company.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      whatsApp: editFormData.whatsApp.trim() || editFormData.phone.trim(),
      website: editFormData.website.trim(),
      status: editFormData.status,
      notes: editFormData.notes.trim(),
    };
    updateLead(lead.id, updates);
    addLeadActivity(lead.id, {
      action: "Contact Details Updated",
      channel: "System",
      details: `Updated by ${currentUser?.name || "User"}`,
      actor: currentUser?.name || "User",
    });
    // Sync with server API
    try {
      fetch("/api/v1/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          ...updates,
          id: lead.id,
          agencyId: currentUser?.role,
        }),
      }).catch(() => {});
    } catch (err) {}
    setIsEditModalOpen(false);
  };

  const handleSavePhoto = () => {
    if (!capturedPhotoUrl) return;
    const updates: Partial<Lead> = {
      photoUrl: capturedPhotoUrl,
      photoType: capturedPhotoType,
    };
    if (pendingExtractedFields) {
      if (pendingExtractedFields.name && (lead.name.startsWith("Card Lead") || lead.name.startsWith("New Lead") || !lead.name || lead.name === "Contact")) {
        updates.name = pendingExtractedFields.name;
      }
      if (pendingExtractedFields.company && !lead.company) updates.company = pendingExtractedFields.company;
      if (pendingExtractedFields.phone && (!lead.phone || !lead.whatsApp)) {
        updates.phone = pendingExtractedFields.phone;
        updates.whatsApp = pendingExtractedFields.phone;
      }
      if (pendingExtractedFields.email && !lead.email) updates.email = pendingExtractedFields.email;
      if (pendingExtractedFields.notes && !lead.notes) updates.notes = pendingExtractedFields.notes;
    }
    updateLead(lead.id, updates);
    addLeadActivity(lead.id, {
      action: "Photo / Card Updated",
      channel: "System",
      details: `${capturedPhotoType === "card" ? "Business card" : "Photo"} attached to contact profile`,
      actor: currentUser?.name || "User",
    });
    // Sync with server API
    try {
      fetch("/api/v1/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          ...updates,
          id: lead.id,
          agencyId: currentUser?.role,
        }),
      }).catch(() => {});
    } catch (err) {}
    setIsPhotoModalOpen(false);
    setPendingExtractedFields(null);
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
              {lead.photoUrl && (
                <Button
                  size="sm"
                  onClick={() => handleAutoExtractFromPhoto()}
                  disabled={isScanningOCR}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isScanningOCR ? "animate-spin" : "text-amber-300"}`} />
                  <span>{isScanningOCR ? "Scanning Card..." : "Auto-Fill OCR"}</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={openEditModal}
                className="text-xs font-bold gap-1.5 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                <span>Edit Lead</span>
              </Button>

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

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-xs font-bold gap-1.5 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span>Delete Lead</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR Status Banner */}
      {ocrAlert && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
            ocrAlert.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-100"
              : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-100"
          }`}
        >
          <div className="flex items-start gap-2 text-xs">
            {ocrAlert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{ocrAlert.type === "success" ? "AI OCR Extraction Result" : "OCR Error"}</p>
              <p className="mt-0.5">{ocrAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setOcrAlert(null)}
            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
            <Card className="border-indigo-200 shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 dark:bg-slate-900">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Attached Card / Photo</span>
                  </div>
                  <Badge variant="purple" className="text-[10px] capitalize">
                    {lead.photoType || "Card"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative shadow-2xs"
                >
                  <img
                    src={lead.photoUrl}
                    alt={lead.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-2.5 py-1 bg-black/70 text-white text-xs font-bold rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Full Image</span>
                    </span>
                  </div>
                </div>

                {/* Primary 1-Click AI OCR Auto-Fill Button */}
                <Button
                  type="button"
                  onClick={() => handleAutoExtractFromPhoto()}
                  disabled={isScanningOCR}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isScanningOCR ? "animate-spin" : "text-amber-300"}`} />
                  <span>{isScanningOCR ? "Scanning Card with AI OCR..." : "🔍 Auto-Fill Details from Card Photo (AI OCR)"}</span>
                </Button>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setCapturedPhotoUrl(lead.photoUrl || "");
                      setIsPhotoModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Replace Photo</span>
                  </button>
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Enlarge</span>
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
                  Click below to snap a picture of a business card or upload an image.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setCapturedPhotoUrl("");
                    setIsPhotoModalOpen(true);
                  }}
                  className="text-xs bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5 cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Snap / Upload Photo</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Missing fields alert banner if card is present */}
          {lead.photoUrl && (!lead.company || !lead.email || (!lead.phone && !lead.whatsApp)) && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Card photo attached without text details</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                We detected an attached card. Click below to automatically read the card text with AI OCR and fill Name, Company, Phone & Email!
              </p>
              <Button
                size="sm"
                disabled={isScanningOCR}
                onClick={() => handleAutoExtractFromPhoto()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isScanningOCR ? "animate-spin" : ""}`} />
                <span>{isScanningOCR ? "Extracting Data..." : "⚡ 1-Click Auto-Fill with OCR"}</span>
              </Button>
            </div>
          )}

          {/* Contact Details Card */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact Information
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={openEditModal}
                className="h-7 text-xs px-2.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950 cursor-pointer"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                <span>Edit</span>
              </Button>
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
              onPhotoCaptured={(url, autoFields) => {
                setCapturedPhotoUrl(url);
                if (autoFields) {
                  setPendingExtractedFields(autoFields);
                }
              }}
              onRemovePhoto={() => {
                setCapturedPhotoUrl("");
                setPendingExtractedFields(null);
              }}
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

      {/* EDIT LEAD DETAILS MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-indigo-600" />
              <span>Edit Lead Information</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update contact details, company name, phone, email, and notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditLead} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <Input
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company</label>
                <Input
                  value={editFormData.company}
                  onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp Number</label>
                <Input
                  value={editFormData.whatsApp}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsApp: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Work Email</label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="e.g. john@acme.com"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Website</label>
                <Input
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                  placeholder="e.g. www.acme.com"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs block mb-1">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as LeadStatus })}
                className="w-full text-xs font-semibold rounded-lg px-3 py-2 bg-white border border-slate-200 dark:bg-slate-800"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs block mb-1">Notes / Address</label>
              <textarea
                rows={3}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Additional details from card, meeting notes, etc."
                className="w-full text-xs rounded-lg p-2.5 bg-white border border-slate-200 dark:bg-slate-800"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Lead &quot;{lead.name}&quot;?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete this contact profile?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <p className="font-bold">This action cannot be undone.</p>
            <p>
              This will permanently remove <strong>{lead.name}</strong> ({lead.company || "Individual"}), all its card photo attachments, and {lead.activities?.length || 0} communication history items from FlowDesk.
            </p>
          </div>

          <DialogFooter className="pt-2 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteLead}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Yes, Delete Permanently</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

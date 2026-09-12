"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  UploadCloud,
  Mail,
  Send,
  Building,
  CheckCircle2,
  Check,
  FolderKanban,
  Zap,
  ArrowRight,
  MoreVertical,
  Trash2,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  PhoneCall,
  ExternalLink,
  Eye,
  Sparkles,
  Download,
  X,
  Phone,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { Lead, LeadStatus } from "@/lib/types";
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

export default function LeadsPage() {
  const {
    currentUser,
    scopedLeads,
    folders,
    templates,
    workflows,
    addLead,
    updateLead,
    deleteLead,
    bulkDeleteLeads,
    bulkUpdateLeadStatus,
    bulkMoveLeadsToFolder,
    updateLeadStatus,
    addLeadToWorkflow,
    addLeadActivity,
    syncLeadsWithServer,
  } = useFlowDesk();

  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedFolder, setSelectedFolder] = useState<string>("ALL");

  // Single Add Lead Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [website, setWebsite] = useState("");
  const [source, setSource] = useState("Manual Entry");
  const [notes, setNotes] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoType, setPhotoType] = useState<"card" | "person" | "document">("card");
  const [showPhotoSection, setShowPhotoSection] = useState(false);

  // Add to Workflow Modal
  const [workflowModalLeadId, setWorkflowModalLeadId] = useState<string | null>(null);
  const [targetWorkflowId, setTargetWorkflowId] = useState<string>(workflows[0]?.id || "");
  const [workflowAlert, setWorkflowAlert] = useState<string | null>(null);

  // Photo Lightbox Preview Modal
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);

  // Attach / Change Photo Modal for existing lead
  const [attachModalLead, setAttachModalLead] = useState<Lead | null>(null);
  const [newAttachedPhotoUrl, setNewAttachedPhotoUrl] = useState<string>("");
  const [newAttachedPhotoType, setNewAttachedPhotoType] = useState<"card" | "person" | "document">("card");
  const [pendingAttachFields, setPendingAttachFields] = useState<any | null>(null);

  // Bulk Selection & Actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkFolderModalOpen, setIsBulkFolderModalOpen] = useState(false);
  const [isBulkWorkflowModalOpen, setIsBulkWorkflowModalOpen] = useState(false);
  const [selectedBulkStatus, setSelectedBulkStatus] = useState<LeadStatus>("Contacted");
  const [selectedBulkFolderId, setSelectedBulkFolderId] = useState("");
  const [selectedBulkWorkflowId, setSelectedBulkWorkflowId] = useState(workflows[0]?.id || "");
  const [bulkAlert, setBulkAlert] = useState<{ type: "success" | "info"; message: string } | null>(null);

  // Single Lead Delete Confirmation modal
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return scopedLeads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchQuery));

      const matchesStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
      const matchesFolder = selectedFolder === "ALL" || lead.folderId === selectedFolder;

      return matchesSearch && matchesStatus && matchesFolder;
    });
  }, [scopedLeads, searchQuery, selectedStatus, selectedFolder]);

  // Bulk Selection Helpers
  const isAllSelected = filteredLeads.length > 0 && selectedIds.length === filteredLeads.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < filteredLeads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    bulkDeleteLeads(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
    setBulkAlert({ type: "success", message: `Successfully deleted ${count} leads.` });
    setTimeout(() => setBulkAlert(null), 4000);
  };

  const handleExecuteBulkStatus = () => {
    if (selectedIds.length === 0) return;
    bulkUpdateLeadStatus(selectedIds, selectedBulkStatus);
    const count = selectedIds.length;
    setSelectedIds([]);
    setIsBulkStatusModalOpen(false);
    setBulkAlert({ type: "success", message: `Updated ${count} leads to status "${selectedBulkStatus}".` });
    setTimeout(() => setBulkAlert(null), 4000);
  };

  const handleExecuteBulkFolder = () => {
    if (selectedIds.length === 0) return;
    const folderObj = folders.find((f) => f.id === selectedBulkFolderId);
    bulkMoveLeadsToFolder(selectedIds, selectedBulkFolderId, folderObj?.name);
    const count = selectedIds.length;
    setSelectedIds([]);
    setIsBulkFolderModalOpen(false);
    setBulkAlert({ type: "success", message: `Moved ${count} leads to folder "${folderObj?.name || "General"}".` });
    setTimeout(() => setBulkAlert(null), 4000);
  };

  const handleExecuteBulkWorkflow = () => {
    if (selectedIds.length === 0 || !selectedBulkWorkflowId) return;
    let enrolled = 0;
    selectedIds.forEach((id) => {
      const res = addLeadToWorkflow(id, selectedBulkWorkflowId);
      if (res.success) enrolled++;
    });
    const wfObj = workflows.find((w) => w.id === selectedBulkWorkflowId);
    setSelectedIds([]);
    setIsBulkWorkflowModalOpen(false);
    setBulkAlert({ type: "success", message: `Enrolled ${enrolled} leads into workflow "${wfObj?.name || "Workflow"}".` });
    setTimeout(() => setBulkAlert(null), 4000);
  };

  const handleExecuteSingleDelete = () => {
    if (!leadToDelete) return;
    const name = leadToDelete.name;
    deleteLead(leadToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== leadToDelete.id));
    setLeadToDelete(null);
    setBulkAlert({ type: "success", message: `Lead "${name}" was permanently deleted.` });
    setTimeout(() => setBulkAlert(null), 4000);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = leadName.trim() || (phone.trim() ? `Contact (${phone.trim()})` : email.trim());
    if (!finalName) {
      return;
    }

    const folderObj = folders.find((f) => f.id === selectedFolderId);

    const createdLead = addLead({
      name: finalName,
      company,
      email,
      phone,
      whatsApp: whatsApp || phone,
      website,
      source: photoUrl ? "Photo / Card Snap" : source,
      notes,
      photoUrl: photoUrl || undefined,
      photoType: photoUrl ? photoType : undefined,
      folderId: selectedFolderId || undefined,
      folderName: folderObj?.name,
    });

    // Also persist to API
    try {
      fetch("/api/v1/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createdLead,
          agencyId: currentUser?.role,
        }),
      }).catch(() => {});
    } catch (err) {}

    if (selectedWorkflowId) {
      addLeadToWorkflow(createdLead.id, selectedWorkflowId);
    }

    setIsAddModalOpen(false);
    setLeadName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setWhatsApp("");
    setWebsite("");
    setNotes("");
    setSelectedFolderId("");
    setSelectedWorkflowId("");
    setPhotoUrl("");
    setPhotoType("card");
    setShowPhotoSection(false);
  };

  const handleEnrollInWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowModalLeadId || !targetWorkflowId) return;

    const res = addLeadToWorkflow(workflowModalLeadId, targetWorkflowId);
    setWorkflowAlert(res.message);
    setTimeout(() => {
      setWorkflowAlert(null);
      setWorkflowModalLeadId(null);
    }, 2000);
  };

  const handleSaveAttachedPhoto = () => {
    if (!attachModalLead || !newAttachedPhotoUrl) return;
    const updates: Partial<Lead> = {
      photoUrl: newAttachedPhotoUrl,
      photoType: newAttachedPhotoType,
    };
    if (pendingAttachFields) {
      if (pendingAttachFields.name && (attachModalLead.name.startsWith("Card Lead") || attachModalLead.name.startsWith("New Lead") || !attachModalLead.name || attachModalLead.name === "Contact")) {
        updates.name = pendingAttachFields.name;
      }
      if (pendingAttachFields.company && !attachModalLead.company) updates.company = pendingAttachFields.company;
      if (pendingAttachFields.phone && (!attachModalLead.phone || !attachModalLead.whatsApp)) {
        updates.phone = pendingAttachFields.phone;
        updates.whatsApp = pendingAttachFields.phone;
      }
      if (pendingAttachFields.email && !attachModalLead.email) updates.email = pendingAttachFields.email;
      if (pendingAttachFields.notes && !attachModalLead.notes) updates.notes = pendingAttachFields.notes;
    }
    updateLead(attachModalLead.id, updates);
    addLeadActivity(attachModalLead.id, {
      action: "Photo Attached to Lead",
      channel: "System",
      details: `${newAttachedPhotoType === "card" ? "Business Card" : "Photo"} attached by ${currentUser?.name || "User"}${pendingAttachFields?.name ? " (OCR auto-filled details)" : ""}`,
      actor: currentUser?.name || "User",
    });
    // Sync with server API
    try {
      fetch("/api/v1/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...attachModalLead,
          ...updates,
          id: attachModalLead.id,
          agencyId: currentUser?.role,
        }),
      }).catch(() => {});
    } catch (err) {}
    setAttachModalLead(null);
    setNewAttachedPhotoUrl("");
    setPendingAttachFields(null);
  };

  const openSnapLeadModal = () => {
    setPhotoUrl("");
    setPhotoType("card");
    setShowPhotoSection(true);
    setIsAddModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Management
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {scopedLeads.length} Leads
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture leads with photos & cards, import spreadsheet batches, organize into folders, and start workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              await syncLeadsWithServer();
              setTimeout(() => setIsSyncing(false), 800);
            }}
            className="text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
          </Button>

          {/* Quick Snap Picture Lead Button */}
          <Button
            size="sm"
            onClick={openSnapLeadModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>Snap Lead Photo</span>
          </Button>

          <Link href="/contacts/import">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100">
              <UploadCloud className="h-4 w-4" />
              <span className="hidden sm:inline">Import Leads</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              setShowPhotoSection(false);
              setIsAddModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Alert Banner for Bulk or Delete Actions */}
      {bulkAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{bulkAlert.message}</span>
          </div>
          <button onClick={() => setBulkAlert(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold">✕</button>
        </div>
      )}

      {/* Floating / Sticky Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 bg-slate-950 text-white rounded-2xl shadow-2xl p-3 sm:px-5 sm:py-3 border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3">
            <div className="h-6 px-2 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {selectedIds.length}
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {selectedIds.length === 1 ? "1 lead selected" : `${selectedIds.length} leads selected`}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBulkStatusModalOpen(true)}
              className="h-8 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Update Status</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBulkFolderModalOpen(true)}
              className="h-8 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
            >
              <FolderKanban className="h-3.5 w-3.5 text-amber-400" />
              <span>Move Folder</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBulkWorkflowModalOpen(true)}
              className="h-8 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white gap-1.5 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Workflow</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by name, company, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 w-full"
              />
            </div>

            {/* Folder Filter */}
            {folders.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-500 font-semibold shrink-0">Folder:</span>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="h-9 w-full md:w-auto rounded-lg border border-slate-200 bg-white text-xs px-2.5 dark:bg-slate-900 dark:border-slate-800"
                >
                  <option value="ALL">All Lead Folders</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.leadCount})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 mr-1">Status:</span>
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
                selectedStatus === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All ({scopedLeads.length})
            </button>
            {ALL_STATUSES.map((st) => {
              const count = scopedLeads.filter((l) => l.status === st).length;
              if (count === 0 && selectedStatus !== st) return null;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
                    selectedStatus === st
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leads Content: Responsive Layout */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No leads found in this view.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={openSnapLeadModal} className="text-xs bg-emerald-600 text-white hover:bg-emerald-700">
                <Camera className="h-3.5 w-3.5 mr-1" />
                Snap Photo / Card
              </Button>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="text-xs bg-indigo-600 text-white">
                Add Lead Manually
              </Button>
              <Link href="/contacts/import">
                <Button size="sm" variant="outline" className="text-xs">
                  Import from Excel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* MOBILE VIEW: Cards layout (visible on sm/xs screens) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className={`border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors ${selectedIds.includes(lead.id) ? "ring-2 ring-indigo-500 bg-indigo-50/20" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  {/* Top Row: Checkbox + Avatar/Photo + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelectOne(lead.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                      {lead.photoUrl ? (
                        <div
                          onClick={() => setPreviewLead(lead)}
                          className="relative h-12 w-12 rounded-xl overflow-hidden border border-indigo-200 shrink-0 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={lead.photoUrl}
                            alt={lead.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setAttachModalLead(lead);
                            setNewAttachedPhotoUrl("");
                          }}
                          className="relative h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center shrink-0 cursor-pointer group hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Click to attach photo"
                        >
                          {lead.name.slice(0, 2).toUpperCase()}
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-2xs border border-slate-200">
                            <Camera className="h-2.5 w-2.5 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                        </div>
                      )}

                      <div className="min-w-0">
                        <Link
                          href={`/contacts/${lead.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 truncate block"
                        >
                          {lead.name}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">
                          {lead.company || "Individual Contact"}
                        </p>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className={`text-[11px] font-bold rounded-lg px-2 py-1 border shrink-0 ${
                        lead.status === "Interested" || lead.status === "Positive"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : lead.status === "Not Interested" || lead.status === "Negative"
                          ? "bg-rose-50 text-rose-700 border-rose-300"
                          : lead.status === "Converted"
                          ? "bg-purple-50 text-purple-700 border-purple-300"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Channels & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {(lead.whatsApp || lead.phone) && (
                        <a
                          href={`tel:${lead.phone || lead.whatsApp}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>Call</span>
                        </a>
                      )}

                      {lead.whatsApp && (
                        <a
                          href={`https://wa.me/${lead.whatsApp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200"
                        >
                          <Send className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {lead.photoUrl && (
                        <button
                          onClick={() => setPreviewLead(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Card</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setWorkflowModalLeadId(lead.id)}
                        className="h-7 px-2 text-[11px] text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        <span>Workflow</span>
                      </Button>

                      <Link href={`/contacts/${lead.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                          Details →
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLeadToDelete(lead)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Footer tags */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {lead.folderName ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                          <FolderKanban className="h-2.5 w-2.5 text-indigo-500" />
                          {lead.folderName}
                        </span>
                      ) : (
                        <span>{lead.source}</span>
                      )}
                    </div>
                    <span>{lead.assignedEmployeeName}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DESKTOP VIEW: Clean Table (visible on md/lg/xl screens) */}
          <Card className="hidden md:block">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                    <th className="p-4 pl-5 w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="p-4 pl-2">Lead / Contact</th>
                    <th className="p-4">Contact Channels</th>
                    <th className="p-4">Folder / Source</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned To</th>
                    <th className="p-4 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedIds.includes(lead.id) ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="p-4 pl-5 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleSelectOne(lead.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 pl-2">
                        <div className="flex items-center gap-3">
                          {/* Photo Thumbnail or Avatar */}
                          {lead.photoUrl ? (
                            <div
                              onClick={() => setPreviewLead(lead)}
                              className="relative h-10 w-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer group shadow-2xs"
                              title="Click to view full photo / card"
                            >
                              <img
                                src={lead.photoUrl}
                                alt={lead.name}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setAttachModalLead(lead);
                                setNewAttachedPhotoUrl("");
                              }}
                              className="relative h-10 w-10 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0 cursor-pointer group hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              title="Click to snap or attach photo"
                            >
                              {lead.name.slice(0, 2).toUpperCase()}
                              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-2xs border border-slate-200">
                                <Camera className="h-2.5 w-2.5 text-slate-400 group-hover:text-indigo-600" />
                              </div>
                            </div>
                          )}

                          <div>
                            <Link href={`/contacts/${lead.id}`} className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white">
                              {lead.name}
                            </Link>
                            <p className="text-[11px] text-slate-500">{lead.company || "Individual Contact"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        <p className="text-emerald-600 font-semibold">{lead.whatsApp || lead.phone || "—"}</p>
                        <p className="text-slate-500 font-normal">{lead.email || "—"}</p>
                      </td>

                      <td className="p-4">
                        {lead.folderName ? (
                          <Badge variant="secondary" className="text-[10px]">
                            <FolderKanban className="h-3 w-3 mr-1" />
                            {lead.folderName}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-500">{lead.source}</span>
                        )}
                      </td>

                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-[11px] font-bold rounded px-2 py-1 border border-slate-200 ${
                            lead.status === "Interested" || lead.status === "Positive"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : lead.status === "Not Interested" || lead.status === "Negative"
                              ? "bg-rose-50 text-rose-700 border-rose-300"
                              : lead.status === "Converted"
                              ? "bg-purple-50 text-purple-700 border-purple-300"
                              : "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{lead.assignedEmployeeName}</p>
                        {lead.managerName && <p className="text-[10px] text-slate-400">Mgr: {lead.managerName}</p>}
                      </td>

                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.photoUrl ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPreviewLead(lead)}
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-indigo-600"
                              title="View full photo"
                            >
                              <ImageIcon className="h-3.5 w-3.5 mr-1" />
                              <span>Photo</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAttachModalLead(lead);
                                setNewAttachedPhotoUrl("");
                              }}
                              className="h-7 px-2 text-[11px] text-slate-400 hover:text-emerald-600"
                              title="Snap / attach photo"
                            >
                              <Camera className="h-3.5 w-3.5 mr-1" />
                              <span>Snap</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setWorkflowModalLeadId(lead.id)}
                            className="h-7 px-2 text-[11px] text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            <span>Workflow</span>
                          </Button>

                          <Link href={`/contacts/${lead.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                              Timeline
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setLeadToDelete(lead)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {/* 1. ADD SINGLE LEAD MODAL WITH CAMERA CAPTURE */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-600" />
              <span>Add Lead & Attach Photo</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Click a picture with your camera, upload a business card, or fill details manually.
            </DialogDescription>
          </DialogHeader>

          {/* Photo Capture Section Toggle */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {photoUrl ? "Photo Attached ✓" : "Snap Picture or Upload Card"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoSection(!showPhotoSection)}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                {showPhotoSection ? "Hide Camera" : photoUrl ? "Change Photo" : "+ Open Camera / Upload"}
              </button>
            </div>

            {showPhotoSection && (
              <div className="animate-in fade-in duration-150">
                <LeadPhotoCapture
                  currentPhotoUrl={photoUrl}
                  onPhotoCaptured={(dataUrl, autoFields) => {
                    setPhotoUrl(dataUrl);
                    if (autoFields?.name) {
                      setLeadName(autoFields.name);
                    }
                    if (autoFields) {
                      if (autoFields.phone) {
                        setPhone(autoFields.phone);
                        if (!whatsApp) setWhatsApp(autoFields.phone);
                      }
                      if (autoFields.email) setEmail(autoFields.email);
                      if (autoFields.company) setCompany(autoFields.company);
                      if (autoFields.notes && !notes) setNotes(autoFields.notes);
                    }
                  }}
                  onRemovePhoto={() => {
                    setPhotoUrl("");
                    setLeadName("");
                    setPhone("");
                    setWhatsApp("");
                    setEmail("");
                    setCompany("");
                    setNotes("");
                  }}
                />
              </div>
            )}

            {photoUrl && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={photoUrl} alt="Attached" className="h-10 w-10 object-cover rounded-lg border border-emerald-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200 truncate">Photo Attached ✓ Ready to Save</p>
                    <p className="text-[10px] text-emerald-600 truncate">Will save as: &quot;{leadName || "Business Card Lead"}&quot;</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateLead}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Create Lead Now</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPhotoUrl("")}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name {photoUrl ? "(Optional if card snapped)" : "*"}</label>
                  <Input required={!photoUrl} placeholder="e.g. John Smith" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                  <Input placeholder="e.g. ABC Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <Input type="email" placeholder="e.g. john@abc.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone / WhatsApp *</label>
                  <Input placeholder="e.g. +91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lead Source</label>
                  <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white">
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="Photo / Card Snap">Photo / Card Snap</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Exhibition">Exhibition / Event</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assign to Folder</label>
                  <select value={selectedFolderId} onChange={(e) => setSelectedFolderId(e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white">
                    <option value="">-- No Folder (Direct Lead) --</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instant Workflow Trigger */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5 text-xs">
                <label className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-purple-600" />
                  <span>Start Automated Workflow Immediately (Optional)</span>
                </label>
                <select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="w-full h-8 rounded-lg border border-purple-200 text-xs px-2.5 bg-white"
                >
                  <option value="">-- Do Not Enroll Yet --</option>
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  Add Lead & Start Marketing
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. PHOTO LIGHTBOX MODAL */}
      <Dialog open={!!previewLead} onOpenChange={() => setPreviewLead(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>{previewLead?.name}&apos;s Business Card / Photo</span>
              <Badge variant="purple" className="text-xs">
                {previewLead?.photoType === "card" ? "Business Card" : "Lead Photo"}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Captured for {previewLead?.company || previewLead?.name} • Attached on {new Date(previewLead?.createdAt || "").toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {previewLead?.photoUrl && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center max-h-[65vh]">
                <img
                  src={previewLead.photoUrl}
                  alt={previewLead.name}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between">
                <a
                  href={previewLead.photoUrl}
                  download={`${previewLead.name.replace(/\s+/g, "_")}_photo.png`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Full Image</span>
                </a>

                <Button
                  size="sm"
                  onClick={() => setPreviewLead(null)}
                  className="text-xs bg-slate-900 text-white hover:bg-slate-800"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. ATTACH / SNAP PHOTO FOR EXISTING LEAD */}
      <Dialog open={!!attachModalLead} onOpenChange={() => setAttachModalLead(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-600" />
              <span>Attach Photo to {attachModalLead?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Take a picture with your camera or upload a business card image for this lead.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <LeadPhotoCapture
              currentPhotoUrl={newAttachedPhotoUrl || attachModalLead?.photoUrl}
              onPhotoCaptured={(url, autoFields) => {
                setNewAttachedPhotoUrl(url);
                if (autoFields) {
                  setPendingAttachFields(autoFields);
                }
              }}
              onRemovePhoto={() => {
                setNewAttachedPhotoUrl("");
                setPendingAttachFields(null);
              }}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAttachModalLead(null)}>Cancel</Button>
              <Button
                type="button"
                disabled={!newAttachedPhotoUrl}
                onClick={handleSaveAttachedPhoto}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Save Photo to Lead
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. ENROLL IN EXISTING WORKFLOW MODAL */}
      <Dialog open={!!workflowModalLeadId} onOpenChange={() => setWorkflowModalLeadId(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Add Existing Lead to Workflow</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select an automated email / WhatsApp sequence to nurture this lead without creating a new campaign.
            </DialogDescription>
          </DialogHeader>

          {workflowAlert ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{workflowAlert}</span>
            </div>
          ) : (
            <form onSubmit={handleEnrollInWorkflow} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Choose Follow-up Workflow:</label>
                <div className="space-y-2">
                  {workflows.map((wf) => (
                    <label
                      key={wf.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        targetWorkflowId === wf.id
                          ? "border-purple-500 bg-purple-50/60 text-purple-900 font-bold"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="radio"
                          name="wf"
                          checked={targetWorkflowId === wf.id}
                          onChange={() => setTargetWorkflowId(wf.id)}
                        />
                        <span>{wf.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{wf.steps.length} Steps</span>
                    </label>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setWorkflowModalLeadId(null)}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                  Confirm & Enroll Lead
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. BULK DELETE CONFIRMATION DIALOG */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete {selectedIds.length} Selected Leads?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete {selectedIds.length} selected contacts?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <p className="font-bold">This bulk deletion cannot be undone.</p>
            <p>
              All {selectedIds.length} selected leads, their card photos, and activity timelines will be permanently removed.
            </p>
          </div>

          <DialogFooter className="pt-2 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteBulkDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Yes, Delete {selectedIds.length} Leads</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. BULK STATUS UPDATE MODAL */}
      <Dialog open={isBulkStatusModalOpen} onOpenChange={setIsBulkStatusModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-indigo-600">
              <Sparkles className="h-5 w-5" />
              <span>Bulk Update Status ({selectedIds.length} Leads)</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Change pipeline status for all {selectedIds.length} selected leads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select New Status:
              </label>
              <select
                value={selectedBulkStatus}
                onChange={(e) => setSelectedBulkStatus(e.target.value as LeadStatus)}
                className="w-full text-xs font-semibold rounded-lg px-3 py-2.5 bg-white border border-slate-200 dark:bg-slate-800 shadow-xs"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsBulkStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteBulkStatus}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer"
              >
                Update {selectedIds.length} Leads
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. BULK MOVE TO FOLDER MODAL */}
      <Dialog open={isBulkFolderModalOpen} onOpenChange={setIsBulkFolderModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-600">
              <FolderKanban className="h-5 w-5" />
              <span>Move to Folder ({selectedIds.length} Leads)</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign all {selectedIds.length} selected leads to a folder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Destination Folder:
              </label>
              <select
                value={selectedBulkFolderId}
                onChange={(e) => setSelectedBulkFolderId(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg px-3 py-2.5 bg-white border border-slate-200 dark:bg-slate-800 shadow-xs"
              >
                <option value="">General (No Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.leadCount})</option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsBulkFolderModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteBulkFolder}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs cursor-pointer"
              >
                Move {selectedIds.length} Leads
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 8. BULK ENROLL IN WORKFLOW MODAL */}
      <Dialog open={isBulkWorkflowModalOpen} onOpenChange={setIsBulkWorkflowModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-purple-600">
              <Zap className="h-5 w-5" />
              <span>Enroll in Workflow ({selectedIds.length} Leads)</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add all {selectedIds.length} selected leads to an automation sequence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Choose Follow-up Workflow:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {workflows.map((wf) => (
                  <label
                    key={wf.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedBulkWorkflowId === wf.id
                        ? "border-purple-600 bg-purple-50/60 text-purple-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="bulkWf"
                        checked={selectedBulkWorkflowId === wf.id}
                        onChange={() => setSelectedBulkWorkflowId(wf.id)}
                      />
                      <span>{wf.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{wf.steps.length} Steps</span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsBulkWorkflowModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteBulkWorkflow}
                disabled={!selectedBulkWorkflowId}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs cursor-pointer"
              >
                Enroll {selectedIds.length} Leads
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 9. SINGLE LEAD DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Lead &quot;{leadToDelete?.name}&quot;?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this lead?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <p className="font-bold">This action cannot be undone.</p>
            <p>
              This will permanently delete <strong>{leadToDelete?.name}</strong> ({leadToDelete?.company || "Individual"}) from your CRM database.
            </p>
          </div>

          <DialogFooter className="pt-2 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setLeadToDelete(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteSingleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Yes, Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
  FolderKanban,
  Zap,
  ArrowRight,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

export default function LeadsPage() {
  const {
    currentUser,
    scopedLeads,
    folders,
    templates,
    workflows,
    addLead,
    deleteLead,
    updateLeadStatus,
    addLeadToWorkflow,
  } = useFlowDesk();

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

  // Add to Workflow Modal
  const [workflowModalLeadId, setWorkflowModalLeadId] = useState<string | null>(null);
  const [targetWorkflowId, setTargetWorkflowId] = useState<string>(workflows[0]?.id || "");
  const [workflowAlert, setWorkflowAlert] = useState<string | null>(null);

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

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return;

    const folderObj = folders.find((f) => f.id === selectedFolderId);

    const createdLead = addLead({
      name: leadName,
      company,
      email,
      phone,
      whatsApp: whatsApp || phone,
      website,
      source,
      notes,
      folderId: selectedFolderId || undefined,
      folderName: folderObj?.name,
    });

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Management
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {scopedLeads.length} Leads
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add single leads, import spreadsheet batches, organize into folders, and start follow-up workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/contacts/import">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100">
              <UploadCloud className="h-4 w-4" />
              <span>Import Leads</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Single Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by name, company, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Folder Filter */}
            {folders.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-500 font-semibold shrink-0">Folder:</span>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white text-xs px-2.5 dark:bg-slate-900 dark:border-slate-800"
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
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
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

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No leads found in this view.</p>
              <div className="flex justify-center gap-2">
                <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="text-xs bg-indigo-600 text-white">
                  Add a Lead Manually
                </Button>
                <Link href="/contacts/import">
                  <Button size="sm" variant="outline" className="text-xs">
                    Import from Excel
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="p-4 pl-5">Lead Name / Company</th>
                  <th className="p-4">Contact Channels</th>
                  <th className="p-4">Folder / Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 1. ADD SINGLE LEAD MODAL (Matches PDF Page 5) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Single Lead</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in contact details and immediately trigger an automated follow-up workflow.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <Input required placeholder="e.g. John Smith" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
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
        </DialogContent>
      </Dialog>

      {/* 2. ENROLL IN EXISTING WORKFLOW MODAL (Matches PDF Page 13) */}
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
    </div>
  );
}

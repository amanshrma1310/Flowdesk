"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Code2,
  ExternalLink,
  Copy,
  Check,
  Zap,
  FolderKanban,
  User,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  Globe,
  Share2,
  CheckCircle2,
  Layers,
  ArrowUp,
  ArrowDown,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { LeadForm, LeadFormField, FieldInputType } from "@/lib/types";

const STARTER_FIELDS: LeadFormField[] = [
  { id: "f-name", label: "Full Name", name: "name", type: "text", required: true, placeholder: "e.g. John Doe" },
  { id: "f-phone", label: "WhatsApp / Phone Number", name: "phone", type: "tel", required: true, placeholder: "e.g. +91 98765 43210" },
  { id: "f-email", label: "Work Email", name: "email", type: "email", required: true, placeholder: "e.g. john@company.com" },
  { id: "f-comp", label: "Company Name", name: "company", type: "text", required: false, placeholder: "e.g. Acme Corp" },
  { id: "f-notes", label: "Requirements / Notes", name: "notes", type: "textarea", required: false, placeholder: "Tell us about your needs..." },
];

export default function FormsPage() {
  const {
    forms,
    folders,
    workflows,
    users,
    createForm,
    updateForm,
    deleteForm,
  } = useFlowDesk();

  // Create / Edit Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Get Free Consultation");
  const [successMessage, setSuccessMessage] = useState("Thank you! Our marketing specialist will contact you shortly.");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [selectedRepId, setSelectedRepId] = useState("");

  // Dynamic Fields State
  const [fields, setFields] = useState<LeadFormField[]>(STARTER_FIELDS);

  // New field creator inside modal
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldInputType>("text");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState("");

  // Embed Modal State
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [activeEmbedForm, setActiveEmbedForm] = useState<LeadForm | null>(null);
  const [activeTab, setActiveTab] = useState<"IFRAME" | "HTML" | "LINK">("IFRAME");
  const [copied, setCopied] = useState(false);

  const openCreateModal = () => {
    setEditingFormId(null);
    setTitle("");
    setDescription("");
    setSubmitButtonText("Get Free Consultation");
    setSuccessMessage("Thank you! Our marketing specialist will contact you shortly.");
    setRedirectUrl("");
    setSelectedFolderId(folders[0]?.id || "");
    setSelectedWorkflowId(workflows[0]?.id || "");
    setSelectedRepId(users[0]?.id || "");
    setFields([...STARTER_FIELDS]);
    setIsOpen(true);
  };

  const openEditModal = (form: LeadForm) => {
    setEditingFormId(form.id);
    setTitle(form.title);
    setDescription(form.description || "");
    setSubmitButtonText(form.submitButtonText);
    setSuccessMessage(form.successMessage);
    setRedirectUrl(form.redirectUrl || "");
    setSelectedFolderId(form.folderId || "");
    setSelectedWorkflowId(form.workflowId || "");
    setSelectedRepId(form.assignedEmployeeId || "");
    setFields(form.fields && form.fields.length > 0 ? form.fields : [...STARTER_FIELDS]);
    setIsOpen(true);
  };

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;

    const fieldKey = newFieldLabel.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    const optionsArray = newFieldType === "select"
      ? newFieldOptions.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

    const newField: LeadFormField = {
      id: `f-${Date.now()}`,
      label: newFieldLabel.trim(),
      name: fieldKey,
      type: newFieldType,
      required: newFieldRequired,
      placeholder: newFieldPlaceholder.trim() || `Enter ${newFieldLabel.trim()}`,
      options: optionsArray,
    };

    setFields([...fields, newField]);
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldOptions("");
    setNewFieldRequired(false);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, idx) => idx !== index));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const newArr = [...fields];
    const [moved] = newArr.splice(index, 1);
    newArr.splice(targetIdx, 0, moved);
    setFields(newArr);
  };

  const openEmbedModal = (form: LeadForm) => {
    setActiveEmbedForm(form);
    setEmbedModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || fields.length === 0) return;

    const targetFolder = folders.find((f) => f.id === selectedFolderId);
    const targetWf = workflows.find((w) => w.id === selectedWorkflowId);
    const targetRep = users.find((u) => u.id === selectedRepId);

    if (editingFormId) {
      updateForm(editingFormId, {
        title,
        description,
        submitButtonText,
        successMessage,
        redirectUrl: redirectUrl.trim() || undefined,
        folderId: selectedFolderId || undefined,
        folderName: targetFolder?.name,
        workflowId: selectedWorkflowId || undefined,
        workflowName: targetWf?.name,
        assignedEmployeeId: selectedRepId || undefined,
        assignedEmployeeName: targetRep?.name,
        fields,
      });
    } else {
      createForm({
        title,
        description,
        submitButtonText,
        successMessage,
        redirectUrl: redirectUrl.trim() || undefined,
        folderId: selectedFolderId || undefined,
        folderName: targetFolder?.name,
        workflowId: selectedWorkflowId || undefined,
        workflowName: targetWf?.name,
        assignedEmployeeId: selectedRepId || undefined,
        assignedEmployeeName: targetRep?.name,
        fields,
        isActive: true,
      });
    }

    setIsOpen(false);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const getIframeCode = (formId: string) => {
    return `<iframe\n  src="${baseUrl}/forms/public/${formId}"\n  width="100%"\n  height="620"\n  frameborder="0"\n  style="border:none; border-radius:16px; max-width:520px;"\n></iframe>`;
  };

  const getHtmlFormCode = (form: LeadForm) => {
    const fieldsHtml = form.fields
      .map((f) => {
        if (f.type === "textarea") {
          return `  <label>${f.label}${f.required ? " *" : ""}</label>\n  <textarea name="${f.name}" ${f.required ? "required" : ""} placeholder="${f.placeholder || ""}"></textarea>`;
        }
        if (f.type === "select" && f.options) {
          const optHtml = f.options.map((o) => `    <option value="${o}">${o}</option>`).join("\n");
          return `  <label>${f.label}${f.required ? " *" : ""}</label>\n  <select name="${f.name}" ${f.required ? "required" : ""}>\n${optHtml}\n  </select>`;
        }
        return `  <label>${f.label}${f.required ? " *" : ""}</label>\n  <input type="${f.type}" name="${f.name}" ${f.required ? "required" : ""} placeholder="${f.placeholder || ""}" />`;
      })
      .join("\n\n");

    return `<!-- FlowDesk AI Lead Capture Form -->\n<form action="${baseUrl}/api/v1/forms/${form.id}/submit" method="POST">\n${fieldsHtml}\n\n  <button type="submit">${form.submitButtonText || "Submit"}</button>\n</form>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Capture Forms & Website Embeds
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {forms.length} Forms
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Build customized website forms with custom fields and welcome redirect URLs. Incoming leads automatically start your marketing workflows.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Lead Form</span>
        </Button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form) => (
          <Card key={form.id} className="hover:border-indigo-300 transition-all flex flex-col justify-between group">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">{form.title}</CardTitle>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {form.fields?.length || 0} Custom Fields • ID: {form.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(form)}
                    title="Edit Form"
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteForm(form.id)}
                    title="Delete Form"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {form.description && (
                <p className="text-xs text-slate-500 line-clamp-2 pt-1">{form.description}</p>
              )}

              {form.redirectUrl && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-indigo-600 font-medium">
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">Welcome Redirect: {form.redirectUrl}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              {/* Linked Automation Attributes */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Folder:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {form.folderName || "General Inquiries"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Auto-Workflow:</span>
                  <strong className="text-purple-600">
                    {form.workflowName || "Standard Follow-up"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Rep:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {form.assignedEmployeeName || "Round Robin"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Leads Captured:</span>
                  <strong className="text-emerald-600 font-bold">
                    {form.submissionCount} Submissions
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEmbedModal(form)}
                  className="h-7 text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Get Website Embed Code</span>
                </Button>

                <a
                  href={`/forms/public/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-medium"
                >
                  <span>Public View</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 1. CREATE / EDIT FORM MODAL WITH DYNAMIC FIELDS BUILDER */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>{editingFormId ? "Edit Lead Form & Fields" : "Create Lead Capture Form"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add customized fields, assign destinations, and set Welcome/Thank You redirect URL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
            {/* General Settings */}
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Form Title *</label>
                <Input
                  required
                  placeholder="e.g. Website Contact & Free Consultation Form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Subtitle</label>
                <Input
                  placeholder="e.g. Fill this out to request a 1-on-1 strategy session with our team."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Welcome Page URL Redirect (Requested Feature) */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 dark:bg-slate-800 dark:border-slate-700">
                <label className="font-bold text-indigo-950 block dark:text-indigo-200 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Welcome / Thank You Page URL (Redirect on Submit)</span>
                </label>
                <Input
                  type="url"
                  placeholder="e.g. https://yourwebsite.com/welcome or https://youragency.com/thank-you"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="bg-white dark:bg-slate-950"
                />
                <p className="text-[10px] text-slate-500">
                  Optional: When visitor submits the form, they will be automatically redirected to this URL. If empty, the success confirmation message is shown.
                </p>
              </div>
            </div>

            {/* DYNAMIC FORM FIELDS BUILDER (Requested Feature) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 dark:bg-slate-800/60 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs dark:text-white flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Form Fields ({fields.length})</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Add, customize, and reorder fields according to your business needs.
                  </p>
                </div>
              </div>

              {/* Active Fields List */}
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs dark:bg-slate-900 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveField(idx, "up")}
                          className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => moveField(idx, "down")}
                          className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Type: {field.type} {field.options ? `(${field.options.length} options)` : ""} • Key: {field.name}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Custom Field Panel */}
              <div className="p-3 bg-white rounded-lg border border-dashed border-indigo-300 space-y-2 dark:bg-slate-900 dark:border-indigo-900">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block">
                  + Add Custom Field:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Field Label *</label>
                    <Input
                      placeholder="e.g. Budget / Property Type"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Field Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as FieldInputType)}
                      className="w-full h-8 rounded border border-slate-200 text-xs px-2 bg-white dark:bg-slate-950 dark:border-slate-800"
                    >
                      <option value="text">Single Line Text</option>
                      <option value="tel">WhatsApp / Phone Number</option>
                      <option value="email">Email Address</option>
                      <option value="number">Numeric Value / Amount</option>
                      <option value="textarea">Multi-line Paragraph</option>
                      <option value="select">Dropdown Select Menu</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Placeholder</label>
                    <Input
                      placeholder="e.g. Enter your budget"
                      value={newFieldPlaceholder}
                      onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {newFieldType === "select" && (
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">
                      Dropdown Options (comma separated)
                    </label>
                    <Input
                      placeholder="e.g. Under $1k, $1k - $5k, $5k - $20k, $20k+"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Make this field required</span>
                  </label>

                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomField}
                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add to Form</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Folder & Automation Settings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Lead Folder</label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white dark:bg-slate-950 dark:border-slate-800"
                >
                  <option value="">-- Select Folder --</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Auto-Enroll Workflow</label>
                <select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white dark:bg-slate-950 dark:border-slate-800"
                >
                  <option value="">-- Select Workflow --</option>
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assign Submissions To</label>
              <select
                value={selectedRepId}
                onChange={(e) => setSelectedRepId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white dark:bg-slate-950 dark:border-slate-800"
              >
                <option value="">-- Round Robin / Unassigned --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Submit Button Text</label>
                <Input
                  placeholder="e.g. Get Free Quote"
                  value={submitButtonText}
                  onChange={(e) => setSubmitButtonText(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Success Message (if no redirect)</label>
                <Input
                  placeholder="e.g. Thank you! We will reach out on WhatsApp within 5 minutes."
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                {editingFormId ? "Save Changes" : "Create Form"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. EMBED CODE & PUBLIC LINK MODAL */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-600" />
              <span>Embed Form: {activeEmbedForm?.title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Copy the embed snippet to paste directly into your WordPress, Wix, Webflow, Shopify, or custom website.
            </DialogDescription>
          </DialogHeader>

          {activeEmbedForm && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Tab Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("IFRAME")}
                  className={`flex-1 py-1.5 font-bold rounded-lg cursor-pointer ${
                    activeTab === "IFRAME" ? "bg-white text-indigo-600 shadow-2xs dark:bg-slate-900" : "text-slate-500"
                  }`}
                >
                  iFrame Embed (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("HTML")}
                  className={`flex-1 py-1.5 font-bold rounded-lg cursor-pointer ${
                    activeTab === "HTML" ? "bg-white text-indigo-600 shadow-2xs dark:bg-slate-900" : "text-slate-500"
                  }`}
                >
                  Pure HTML Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("LINK")}
                  className={`flex-1 py-1.5 font-bold rounded-lg cursor-pointer ${
                    activeTab === "LINK" ? "bg-white text-indigo-600 shadow-2xs dark:bg-slate-900" : "text-slate-500"
                  }`}
                >
                  Direct Shareable Link
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={activeTab === "LINK" ? 2 : 7}
                  value={
                    activeTab === "IFRAME"
                      ? getIframeCode(activeEmbedForm.id)
                      : activeTab === "HTML"
                      ? getHtmlFormCode(activeEmbedForm)
                      : `${baseUrl}/forms/public/${activeEmbedForm.id}`
                  }
                  className="w-full p-3 bg-slate-950 text-indigo-300 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none"
                />

                <Button
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      activeTab === "IFRAME"
                        ? getIframeCode(activeEmbedForm.id)
                        : activeTab === "HTML"
                        ? getHtmlFormCode(activeEmbedForm)
                        : `${baseUrl}/forms/public/${activeEmbedForm.id}`
                    )
                  }
                  className="absolute top-2 right-2 h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold gap-1 shadow-xs"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied!" : "Copy Snippet"}</span>
                </Button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Automated Workflow Ingestion Active</span>
                </div>
                <p>
                  Any visitor who submits this form on your website will immediately appear in your <strong>{activeEmbedForm.folderName || "Leads"}</strong> list and automatically trigger <strong>{activeEmbedForm.workflowName || "Initial Follow-up Sequence"}</strong>!
                  {activeEmbedForm.redirectUrl && (
                    <span className="block mt-1 font-semibold text-indigo-700 dark:text-indigo-300">
                      ➔ Redirects to: {activeEmbedForm.redirectUrl}
                    </span>
                  )}
                </p>
              </div>

              <DialogFooter className="pt-1">
                <a
                  href={`/forms/public/${activeEmbedForm.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs font-semibold">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Live Test Page</span>
                  </Button>
                </a>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

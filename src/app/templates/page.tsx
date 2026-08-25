"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Mail,
  Send,
  Trash2,
  Edit,
  Copy,
  Check,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { MarketingTemplate, TemplateChannel } from "@/lib/types";

const DYNAMIC_VARIABLES = [
  "{{first_name}}",
  "{{last_name}}",
  "{{company}}",
  "{{email}}",
  "{{phone}}",
];

export default function TemplatesPage() {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useFlowDesk();

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form Fields
  const [templateName, setTemplateName] = useState("");
  const [channel, setChannel] = useState<TemplateChannel>("Email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [previewMode, setPreviewMode] = useState(false);

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setTemplateName("");
    setChannel("Email");
    setSubject("");
    setBody("");
    setPreviewMode(false);
    setIsOpen(true);
  };

  const openEditModal = (tpl: MarketingTemplate) => {
    setEditingTemplateId(tpl.id);
    setTemplateName(tpl.name);
    setChannel(tpl.channel);
    setSubject(tpl.subject || "");
    setBody(tpl.body);
    setPreviewMode(false);
    setIsOpen(true);
  };

  const handleDuplicate = (tpl: MarketingTemplate) => {
    createTemplate({
      name: `${tpl.name} (Copy)`,
      channel: tpl.channel,
      subject: tpl.subject,
      body: tpl.body,
    });
  };

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + " " + variable);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !body.trim()) return;

    if (editingTemplateId) {
      updateTemplate(editingTemplateId, {
        name: templateName,
        channel,
        subject: channel === "Email" ? subject : undefined,
        body,
      });
    } else {
      createTemplate({
        name: templateName,
        channel,
        subject: channel === "Email" ? subject : undefined,
        body,
      });
    }

    setIsOpen(false);
  };

  const getResolvedPreview = (text: string) => {
    return text
      .replace(/{{first_name}}/g, "Aman")
      .replace(/{{last_name}}/g, "Sharma")
      .replace(/{{company}}/g, "Apex Growth Ltd")
      .replace(/{{email}}/g, "aman@apex.com")
      .replace(/{{phone}}/g, "+91 98765 43210");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Marketing Templates
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {templates.length} Templates
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, and personalize Email and WhatsApp messages with dynamic customer variables (PDF Pages 7 & 8).
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Template</span>
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="hover:border-indigo-300 transition-all flex flex-col justify-between group">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={tpl.channel === "WhatsApp" ? "success" : "default"}
                    className="text-[10px]"
                  >
                    {tpl.channel === "WhatsApp" ? <Send className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                    {tpl.channel}
                  </Badge>
                  <CardTitle className="text-sm font-bold">{tpl.name}</CardTitle>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(tpl)}
                    title="Edit Template"
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(tpl)}
                    title="Duplicate Template"
                    className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    title="Delete Template"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {tpl.subject && (
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject: {tpl.subject}
                </p>
              )}
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                {tpl.body}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Created by {tpl.createdByName}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(tpl)}
                  className="h-6 px-2 text-[10px] font-semibold"
                >
                  <Edit className="h-2.5 w-2.5 mr-1" />
                  <span>Edit Content</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>{editingTemplateId ? "Edit Marketing Template" : "Create Marketing Template"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure message copy and insert personalized variables.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Template Name *</label>
              <Input
                required
                placeholder="e.g. August Product Promotion"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Channel *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel("Email")}
                  className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    channel === "Email" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 text-sky-600" />
                  <span>Email Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("WhatsApp")}
                  className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    channel === "WhatsApp" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp Template</span>
                </button>
              </div>
            </div>

            {channel === "Email" && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Subject *</label>
                <Input
                  required
                  placeholder="e.g. Grow your business with our solution"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Message Body *</label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>{previewMode ? "Back to Edit" : "Live Customer Preview"}</span>
                </button>
              </div>

              {!previewMode ? (
                <>
                  {/* Dynamic Variables Pill Bar */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {DYNAMIC_VARIABLES.map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => insertVariable(v)}
                        className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                      >
                        + {v}
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    rows={5}
                    placeholder={
                      channel === "WhatsApp"
                        ? "Hi {{first_name}},\n\nWe have a special solution for {{company}}.\n\nReply:\n1 - Yes\n2 - No"
                        : "Hello {{first_name}},\n\nWe would like to introduce..."
                    }
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950"
                  />
                </>
              ) : (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 font-mono text-xs text-indigo-950 whitespace-pre-wrap dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <span className="text-[10px] font-bold text-indigo-600 block mb-1">
                    Preview with Sample Lead (Aman Sharma from Apex Growth Ltd):
                  </span>
                  {getResolvedPreview(body || "No body content entered.")}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                {editingTemplateId ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

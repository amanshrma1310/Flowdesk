"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Plus,
  Send,
  Mail,
  CheckCircle2,
  Clock,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function AdminTemplatesPage() {
  const { templates, approveTemplate, createTemplate, currentUser } = useFlowDesk();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplChannel, setTplChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");
  const [isCompanyWide, setIsCompanyWide] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim() || !tplBody.trim()) return;

    createTemplate({
      name: tplName,
      channel: tplChannel,
      subject: tplChannel === "EMAIL" ? tplSubject : undefined,
      body: tplBody,
      isCompanyWide,
    });

    setIsCreateOpen(false);
    setTplName("");
    setTplSubject("");
    setTplBody("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Template Approval & Governance System
            </h1>
            <Badge variant="purple" className="text-xs font-bold">Admin Console</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve marketing templates submitted by employees before company-wide deployment.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Company Template</span>
        </Button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{tpl.name}</h3>
                    <Badge
                      variant={tpl.channel === "WHATSAPP" ? "success" : "default"}
                      className="text-[10px]"
                    >
                      {tpl.channel === "WHATSAPP" ? <Send className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                      {tpl.channel}
                    </Badge>
                    <Badge
                      variant={
                        tpl.status === "APPROVED"
                          ? "success"
                          : tpl.status === "PENDING_APPROVAL"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {tpl.status}
                    </Badge>
                    {tpl.isCompanyWide && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded dark:bg-indigo-950 dark:text-indigo-300">
                        Company-Wide
                      </span>
                    )}
                  </div>

                  {tpl.subject && (
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject: {tpl.subject}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono leading-relaxed max-w-2xl dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                    {tpl.body}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Submitted by: <strong>{tpl.createdByName}</strong> • {tpl.createdAt}
                    {tpl.approvedBy && <span> • Approved by: <strong className="text-emerald-600">{tpl.approvedBy}</strong></span>}
                  </p>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {tpl.status === "PENDING_APPROVAL" && (
                    <Button
                      size="sm"
                      onClick={() => approveTemplate(tpl.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve for Company</span>
                    </Button>
                  )}
                  {tpl.status === "APPROVED" && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Live & Ready
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Marketing Message Template</DialogTitle>
            <DialogDescription className="text-xs">
              Supports dynamic variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">&#123;&#123;first_name&#125;&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">&#123;&#123;company&#125;&#125;</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Template Identifier *</label>
              <Input
                required
                placeholder="e.g. real_estate_vip_offer"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTplChannel("WHATSAPP")}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    tplChannel === "WHATSAPP" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTplChannel("EMAIL")}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    tplChannel === "EMAIL" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {tplChannel === "EMAIL" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
                <Input
                  placeholder="e.g. Exclusive VIP Opportunity for {{company}}"
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message Body *</label>
              <textarea
                required
                placeholder="Hi {{first_name}} 👋 We have an exclusive update regarding {{company}}..."
                value={tplBody}
                onChange={(e) => setTplBody(e.target.value)}
                className="w-full h-24 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Save & Approve
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

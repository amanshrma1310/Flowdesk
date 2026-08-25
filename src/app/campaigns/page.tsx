"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Mail,
  Send,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  FolderKanban,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { TemplateChannel, CampaignStatus } from "@/lib/types";

export default function CampaignsPage() {
  const {
    campaigns,
    folders,
    templates,
    leads,
    createCampaign,
    updateCampaignStatus,
  } = useFlowDesk();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<TemplateChannel>("Email");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [sendOption, setSendOption] = useState<"NOW" | "SCHEDULE">("NOW");
  const [scheduleTime, setScheduleTime] = useState("");

  const filteredTemplates = templates.filter((t) => t.channel === selectedChannel);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !selectedFolderId || !selectedTemplateId) return;

    const folderObj = folders.find((f) => f.id === selectedFolderId);
    const templateObj = templates.find((t) => t.id === selectedTemplateId);

    createCampaign({
      name: campaignName,
      folderId: selectedFolderId,
      folderName: folderObj?.name || "Folder",
      channel: selectedChannel,
      templateId: selectedTemplateId,
      templateName: templateObj?.name || "Template",
      status: sendOption === "NOW" ? "Running" : "Scheduled",
      scheduledAt: sendOption === "SCHEDULE" ? scheduleTime : undefined,
      totalLeads: folderObj?.leadCount || 0,
    });

    setIsCreateOpen(false);
    setCampaignName("");
    setSelectedFolderId("");
    setSelectedTemplateId("");
    setScheduleTime("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Marketing Campaigns
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {campaigns.length} Campaigns
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select Lead List ➔ Select Email/WhatsApp Template ➔ Launch Campaign ➔ Track Responses (PDF Pages 7, 8, 10).
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No marketing campaigns created yet. Select a lead folder and template to launch your first blast.
            </p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 text-white text-xs">
              Create First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <Card key={camp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{camp.name}</h3>
                      <Badge
                        variant={camp.channel === "WhatsApp" ? "success" : "default"}
                        className="text-[10px]"
                      >
                        {camp.channel === "WhatsApp" ? <Send className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                        {camp.channel}
                      </Badge>
                      <Badge
                        variant={
                          camp.status === "Running"
                            ? "success"
                            : camp.status === "Completed"
                            ? "purple"
                            : camp.status === "Paused"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {camp.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                        List: {camp.folderName}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        Template: {camp.templateName}
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Launched by {camp.createdByName} • {camp.createdAt}
                      {camp.scheduledAt && <span> • Scheduled for: <strong>{camp.scheduledAt}</strong></span>}
                    </p>
                  </div>

                  {/* Delivery & Response Metrics (PDF Pages 4, 8, 10) */}
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-xs">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Sent</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{camp.sentCount}</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Delivered</span>
                      <strong className="text-emerald-600 font-bold">{camp.deliveredCount}</strong>
                    </div>
                    {camp.channel === "Email" && (
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Opened</span>
                        <strong className="text-sky-600 font-bold">{camp.openedCount || 0}</strong>
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Replies</span>
                      <strong className="text-purple-600 font-bold">{camp.repliedCount}</strong>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {camp.status === "Running" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCampaignStatus(camp.id, "Paused")}
                        className="text-xs font-semibold gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                      >
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </Button>
                    ) : camp.status === "Paused" ? (
                      <Button
                        size="sm"
                        onClick={() => updateCampaignStatus(camp.id, "Running")}
                        className="text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Resume</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE CAMPAIGN DIALOG (Matches PDF Process: Lead List ➔ Template ➔ Send Now/Schedule) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Marketing Campaign</DialogTitle>
            <DialogDescription className="text-xs">
              Follow the simple 4-step process: Select Lead List ➔ Select Template ➔ Launch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campaign Name *</label>
              <Input
                required
                placeholder="e.g. August SaaS Promotion"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            {/* Step 1: Lead List */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">1. Select Target Lead List / Folder *</label>
              <select
                required
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white"
              >
                <option value="">-- Choose Lead List --</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.leadCount} Leads)
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Channel Selection */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">2. Marketing Channel *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChannel("Email");
                    setSelectedTemplateId("");
                  }}
                  className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedChannel === "Email"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 text-sky-600" />
                  <span>Email Marketing</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedChannel("WhatsApp");
                    setSelectedTemplateId("");
                  }}
                  className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedChannel === "WhatsApp"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp Marketing</span>
                </button>
              </div>
            </div>

            {/* Step 3: Template Selection */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">3. Select {selectedChannel} Template *</label>
              <select
                required
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white"
              >
                <option value="">-- Choose {selectedChannel} Template --</option>
                {filteredTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.subject ? `(${t.subject})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Send Now or Schedule */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">4. Delivery Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSendOption("NOW")}
                  className={`p-2 rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                    sendOption === "NOW" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200"
                  }`}
                >
                  <span>Send Immediately</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSendOption("SCHEDULE")}
                  className={`p-2 rounded-lg border font-semibold flex items-center justify-center gap-1 ${
                    sendOption === "SCHEDULE" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>Schedule Later</span>
                </button>
              </div>

              {sendOption === "SCHEDULE" && (
                <div className="pt-2">
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Launch Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

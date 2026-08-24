"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Flame,
  UserCheck,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Tag,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const { contacts, timelines, updateContact, addTimelineEvent, sendMessage, addTask } = useFlowDesk();

  const contact = contacts.find((c) => c.id === contactId) || contacts[0];
  const timelineEvents = timelines[contact?.id] || [
    {
      id: "tl-default-1",
      type: "IMPORTED",
      title: "Added from Excel Importer",
      description: "Auto-mapped and sanitized contact fields.",
      createdAt: "Aug 18, 10:30 AM",
      userName: "Smart Importer",
      channel: "SYSTEM",
    },
  ];

  // Quick Action State
  const [activeAction, setActiveAction] = useState<"NONE" | "WHATSAPP" | "EMAIL" | "TASK" | "NOTE">("NONE");
  const [whatsappMsg, setWhatsappMsg] = useState(`Hi ${contact?.name?.split(" ")[0] || "there"} 👋 Thanks for your interest in our services!`);
  const [emailSubject, setEmailSubject] = useState(`Next Steps for ${contact?.company || "Your Project"}`);
  const [emailBody, setEmailBody] = useState(`Hi ${contact?.name || ""},\n\nI am reaching out regarding your inquiry. Would you have 15 minutes for a quick call?`);
  const [taskTitle, setTaskTitle] = useState(`Follow up with ${contact?.name}`);
  const [noteText, setNoteText] = useState("");
  const [sentAlert, setSentAlert] = useState<string | null>(null);

  if (!contact) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-slate-500">Contact not found.</p>
        <Link href="/contacts">
          <Button variant="outline" size="sm">Back to Contacts</Button>
        </Link>
      </div>
    );
  }

  const handleSendWhatsApp = () => {
    if (!whatsappMsg.trim()) return;
    sendMessage(contact.id, whatsappMsg, "WHATSAPP");
    setSentAlert("WhatsApp message sent successfully via Official API!");
    setActiveAction("NONE");
    setTimeout(() => setSentAlert(null), 3500);
  };

  const handleSendEmail = () => {
    if (!emailBody.trim()) return;
    addTimelineEvent(contact.id, {
      type: "EMAIL_SENT",
      title: `Email Sent: ${emailSubject}`,
      description: emailBody,
      channel: "EMAIL",
    });
    setSentAlert("Email delivered with open & click tracking active!");
    setActiveAction("NONE");
    setTimeout(() => setSentAlert(null), 3500);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle,
      contactId: contact.id,
      contactName: contact.name,
      contactCompany: contact.company,
      dueDate: "Tomorrow, 10:00 AM",
      priority: "HIGH",
    });
    addTimelineEvent(contact.id, {
      type: "TASK_CREATED",
      title: `Task Created: ${taskTitle}`,
      description: `Assigned to ${contact.assignedTo?.name || "Sales Rep"}. Due Tomorrow 10:00 AM.`,
      channel: "TASK",
    });
    setSentAlert("Task added to team checklist!");
    setActiveAction("NONE");
    setTimeout(() => setSentAlert(null), 3500);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addTimelineEvent(contact.id, {
      type: "NOTE",
      title: "Note Added",
      description: noteText,
      channel: "SYSTEM",
    });
    setNoteText("");
    setSentAlert("Note attached to 360 profile.");
    setActiveAction("NONE");
    setTimeout(() => setSentAlert(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Alert */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/contacts")}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Contacts</span>
        </button>

        {sentAlert && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>{sentAlert}</span>
          </div>
        )}
      </div>

      {/* Main Profile Header Card */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/20 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {contact.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {contact.name}
                  </h1>
                  <Badge variant="purple" className="text-xs">
                    {contact.status}
                  </Badge>
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <Flame className="h-3 w-3" /> Lead Score {contact.leadScore}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  {contact.title && <span className="font-semibold text-slate-700 dark:text-slate-300">{contact.title}</span>}
                  {contact.company && (
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {contact.company}
                    </span>
                  )}
                  {contact.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {contact.location}
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-4 pt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone || "No phone added"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {contact.email || "No email added"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setActiveAction(activeAction === "WHATSAPP" ? "NONE" : "WHATSAPP")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveAction(activeAction === "EMAIL" ? "NONE" : "EMAIL")}
                className="text-xs font-semibold gap-1.5 border-slate-300"
              >
                <Mail className="h-3.5 w-3.5 text-sky-600" />
                <span>Email</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveAction(activeAction === "TASK" ? "NONE" : "TASK")}
                className="text-xs font-semibold gap-1.5 border-slate-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                <span>Task</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveAction(activeAction === "NOTE" ? "NONE" : "NOTE")}
                className="text-xs font-semibold gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Note</span>
              </Button>
            </div>
          </div>

          {/* Collapsible Action Drawer */}
          {activeAction !== "NONE" && (
            <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in">
              {activeAction === "WHATSAPP" && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Send Official WhatsApp Message to {contact.phone}</span>
                  </p>
                  <textarea
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    className="w-full h-20 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleSendWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                      Send WhatsApp Now
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "EMAIL" && (
                <div className="space-y-2">
                  <Input
                    placeholder="Email Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="text-xs"
                  />
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full h-24 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleSendEmail} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs">
                      Send Email
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "TASK" && (
                <div className="space-y-2">
                  <Input
                    placeholder="Task Description"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleCreateTask} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs">
                      Create Task
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "NOTE" && (
                <div className="space-y-2">
                  <textarea
                    placeholder="Type private customer note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full h-20 p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleAddNote} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs">
                      Save Note
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: 360 Information & Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 360 Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold">360° Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Lead Source</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{contact.source}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Assigned Sales Rep</span>
                <span className="font-semibold text-indigo-600 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  {contact.assignedTo?.name || "Rahul Kumar"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Lead Score</span>
                <span className="font-bold text-emerald-600">{contact.leadScore} / 100</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created Date</span>
                <span className="text-slate-700 dark:text-slate-300">Aug 20, 2026</span>
              </div>

              {/* Tags */}
              <div className="pt-2">
                <p className="text-slate-500 mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((t) => (
                    <Badge key={t.id} variant="secondary" className="text-[10px]">
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              {contact.customFields && Object.keys(contact.customFields).length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-slate-500 font-semibold">Custom Ingestion Fields</p>
                  {Object.entries(contact.customFields).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">{k}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Chronological Activity Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>360° Activity Timeline</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological history of automations, WhatsApps, emails, and notes.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                {timelineEvents.map((evt) => (
                  <div key={evt.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs ${
                        evt.channel === "WHATSAPP"
                          ? "bg-emerald-600"
                          : evt.channel === "EMAIL"
                          ? "bg-sky-600"
                          : evt.channel === "TASK"
                          ? "bg-amber-600"
                          : "bg-indigo-600"
                      }`}
                    >
                      {evt.channel === "WHATSAPP" ? (
                        <Send className="h-2.5 w-2.5" />
                      ) : evt.channel === "EMAIL" ? (
                        <Mail className="h-2.5 w-2.5" />
                      ) : evt.channel === "TASK" ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : (
                        <Sparkles className="h-2.5 w-2.5" />
                      )}
                    </div>

                    {/* Timeline Card Content */}
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1 dark:border-slate-800 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {evt.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {evt.createdAt}
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                          {evt.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 pt-0.5">
                        Triggered by: <span className="font-semibold text-slate-600 dark:text-slate-300">{evt.userName || "System"}</span>
                      </p>
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

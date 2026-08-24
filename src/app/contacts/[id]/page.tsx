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
  Flame,
  UserCheck,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Zap,
  ShieldAlert,
  FolderKanban,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const {
    allContacts,
    leadJourneys,
    automations,
    updateContact,
    sendMessage,
    addTask,
    toggleDoNotContact,
    enrollLeadInWorkflow,
  } = useFlowDesk();

  const contact = allContacts.find((c) => c.id === contactId) || allContacts[0];
  const journeySteps = leadJourneys[contact?.id] || [
    {
      id: "j-default",
      title: "Lead Created & Ingested",
      description: "Imported into system. Columns auto-mapped.",
      timestamp: "Aug 20, 10:30 AM",
      actor: "Smart Importer",
      channel: "SYSTEM",
      status: "COMPLETED",
    },
  ];

  // Actions
  const [activeAction, setActiveAction] = useState<"NONE" | "WHATSAPP" | "EMAIL" | "TASK" | "ENROLL">("NONE");
  const [whatsappMsg, setWhatsappMsg] = useState(`Hi ${contact?.name?.split(" ")[0] || "there"} 👋 Thanks for your interest in our services!`);
  const [emailSubject, setEmailSubject] = useState(`Next Steps for ${contact?.company || "Your Project"}`);
  const [emailBody, setEmailBody] = useState(`Hi ${contact?.name || ""},\n\nI am reaching out regarding your inquiry.`);
  const [taskTitle, setTaskTitle] = useState(`Follow up with ${contact?.name}`);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(automations[0]?.id || "auto-1");
  const [enrollAlert, setEnrollAlert] = useState<{ success: boolean; message: string } | null>(null);

  if (!contact) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-slate-500">Lead not found.</p>
        <Link href="/contacts">
          <Button variant="outline" size="sm">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  const handleSendWhatsApp = () => {
    if (!whatsappMsg.trim()) return;
    sendMessage(contact.id, whatsappMsg, "WHATSAPP");
    setActiveAction("NONE");
  };

  const handleSendEmail = () => {
    if (!emailBody.trim()) return;
    sendMessage(contact.id, emailBody, "EMAIL");
    setActiveAction("NONE");
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
    setActiveAction("NONE");
  };

  const handleEnrollWorkflow = () => {
    const res = enrollLeadInWorkflow(contact.id, selectedWorkflowId);
    setEnrollAlert(res);
    setTimeout(() => setEnrollAlert(null), 4000);
    setActiveAction("NONE");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Alerts */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/contacts")}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Leads</span>
        </button>

        {/* Global Do Not Contact / Opt-out Switch */}
        <button
          onClick={() => toggleDoNotContact(contact.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            contact.doNotContact
              ? "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <ShieldAlert className={`h-4 w-4 ${contact.doNotContact ? "text-rose-600" : "text-slate-500"}`} />
          <span>{contact.doNotContact ? "Do Not Contact (Opted Out)" : "Mark Do Not Contact / STOP"}</span>
        </button>
      </div>

      {enrollAlert && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            enrollAlert.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {enrollAlert.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          <span>{enrollAlert.message}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/20 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
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

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setActiveAction(activeAction === "ENROLL" ? "NONE" : "ENROLL")}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Add to Workflow</span>
              </Button>

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
            </div>
          </div>

          {/* Action Drawer */}
          {activeAction !== "NONE" && (
            <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in">
              {activeAction === "ENROLL" && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span>Enroll Lead in Automated Communication Workflow</span>
                  </p>
                  <select
                    value={selectedWorkflowId}
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 text-xs px-3 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                  >
                    {automations.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.category})
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAction("NONE")}>Cancel</Button>
                    <Button size="sm" onClick={handleEnrollWorkflow} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs">
                      Confirm & Start Workflow
                    </Button>
                  </div>
                </div>
              )}

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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: 3-Point Ownership, Lead List & Lead Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 3-Point Ownership & Folder Box */}
        <div className="space-y-6">
          {/* Ownership Box */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>3-Point Ownership</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Created By</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{contact.createdByName}</span>
              </div>
              <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 space-y-1 dark:bg-indigo-950/40 dark:border-indigo-900">
                <span className="text-[10px] text-indigo-600 block uppercase font-bold">Assigned Owner (Sales Rep)</span>
                <span className="font-bold text-indigo-900 dark:text-indigo-200">{contact.ownerName}</span>
              </div>
              <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-100 space-y-1 dark:bg-purple-950/40 dark:border-purple-900">
                <span className="text-[10px] text-purple-600 block uppercase font-bold">Pod Manager</span>
                <span className="font-bold text-purple-900 dark:text-purple-200">{contact.managerName}</span>
              </div>
              {contact.leadListName && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1 dark:bg-slate-800 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" /> Lead Folder
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{contact.leadListName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: "LEAD JOURNEY" Graphical Single Source of Truth */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>The Complete Lead Journey</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Single source of truth tracking ingestion, automations, AI classification and conversions.
                  </CardDescription>
                </div>
                {contact.activeWorkflowName && (
                  <Badge variant="purple" className="text-[10px]">
                    Flow: {contact.activeWorkflowName}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100 dark:before:bg-slate-800">
                {journeySteps.map((step) => (
                  <div key={step.id} className="relative group">
                    <div
                      className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs ${
                        step.channel === "WHATSAPP"
                          ? "bg-emerald-600"
                          : step.channel === "EMAIL"
                          ? "bg-sky-600"
                          : step.channel === "AI"
                          ? "bg-purple-600"
                          : step.channel === "TASK"
                          ? "bg-amber-600"
                          : "bg-indigo-600"
                      }`}
                    >
                      {step.channel === "AI" ? (
                        <Bot className="h-2.5 w-2.5" />
                      ) : step.channel === "WHATSAPP" ? (
                        <Send className="h-2.5 w-2.5" />
                      ) : step.channel === "EMAIL" ? (
                        <Mail className="h-2.5 w-2.5" />
                      ) : (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1 dark:border-slate-800 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {step.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                        {step.description}
                      </p>
                      <p className="text-[10px] text-slate-400 pt-0.5">
                        Actor: <strong className="text-slate-600 dark:text-slate-300">{step.actor}</strong>
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

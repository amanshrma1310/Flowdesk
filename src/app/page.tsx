"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  User,
  Megaphone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Plus,
  UploadCloud,
  FileText,
  Zap,
  ArrowRight,
  Shield,
  MessageSquare,
  Sparkles,
  Phone,
  FolderKanban,
  Check,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { LeadStatus } from "@/lib/types";

export default function DashboardPage() {
  const {
    currentUser,
    organization,
    users,
    leads,
    scopedLeads,
    campaigns,
    workflows,
    responses,
    templates,
    updateLeadStatus,
    addLeadActivity,
    updateCampaignStatus,
    addLead,
  } = useFlowDesk();

  // Quick Action Modals from Dashboard
  const [quickLeadModalOpen, setQuickLeadModalOpen] = useState(false);
  const [quickLeadName, setQuickLeadName] = useState("");
  const [quickLeadPhone, setQuickLeadPhone] = useState("");
  const [quickLeadEmail, setQuickLeadEmail] = useState("");
  const [quickLeadCompany, setQuickLeadCompany] = useState("");

  const [quickOutreachLead, setQuickOutreachLead] = useState<any | null>(null);
  const [outreachChannel, setOutreachChannel] = useState<"WhatsApp" | "Email">("WhatsApp");
  const [outreachMessage, setOutreachMessage] = useState("");
  const [outreachSuccess, setOutreachSuccess] = useState<string | null>(null);

  if (!currentUser || !organization) return null;

  const isAdmin = currentUser.role === "ADMIN";
  const isManager = currentUser.role === "MANAGER";
  const isEmployee = currentUser.role === "EMPLOYEE";

  // Common metrics
  const managers = users.filter((u) => u.role === "MANAGER");
  const employees = users.filter((u) => u.role === "EMPLOYEE");
  const activeCampaigns = campaigns.filter((c) => c.status === "Running");

  // Manager specific metrics
  const myTeamEmployees = employees.filter((e) => e.managerId === currentUser.id);

  // Employee specific metrics
  const myFollowups = scopedLeads.filter((l) => l.status === "Follow-up" || l.status === "New");
  const myInterestedLeads = scopedLeads.filter((l) => l.status === "Interested" || l.status === "Positive");
  const myConvertedLeads = scopedLeads.filter((l) => l.status === "Converted");

  // Aggregates for Admin
  const totalEmailsSent = campaigns
    .filter((c) => c.channel === "Email")
    .reduce((acc, c) => acc + c.sentCount, 0);

  const totalWhatsAppSent = campaigns
    .filter((c) => c.channel === "WhatsApp")
    .reduce((acc, c) => acc + c.sentCount, 0);

  const totalSuccessfulResponses = responses.filter((r) => r.sentiment === "Positive").length;
  const totalFailedMessages = campaigns.reduce((acc, c) => acc + c.failedCount, 0);

  const handleQuickAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLeadName.trim()) return;

    addLead({
      name: quickLeadName,
      phone: quickLeadPhone,
      whatsApp: quickLeadPhone,
      email: quickLeadEmail,
      company: quickLeadCompany,
      source: "Dashboard Quick Entry",
    });

    setQuickLeadModalOpen(false);
    setQuickLeadName("");
    setQuickLeadPhone("");
    setQuickLeadEmail("");
    setQuickLeadCompany("");
  };

  const openOutreach = (lead: any, channel: "WhatsApp" | "Email") => {
    setQuickOutreachLead(lead);
    setOutreachChannel(channel);
    if (channel === "WhatsApp") {
      setOutreachMessage(`Hi ${lead.name.split(" ")[0]} 👋 We have an exclusive solution for ${lead.company || "your business"}. Would you like to see a quick demo?\n\nReply:\n1 - Yes\n2 - No`);
    } else {
      setOutreachMessage(`Hello ${lead.name.split(" ")[0]},\n\nWe wanted to introduce our marketing solutions for ${lead.company || "your team"}. Let me know if you are open to a quick chat.`);
    }
  };

  const handleSendOutreach = () => {
    if (!quickOutreachLead) return;

    addLeadActivity(quickOutreachLead.id, {
      action: `${outreachChannel} Message Sent from Dashboard`,
      channel: outreachChannel,
      details: outreachMessage.slice(0, 100) + "...",
      actor: currentUser.name,
    });

    updateLeadStatus(quickOutreachLead.id, "Contacted");
    setOutreachSuccess(`Message sent to ${quickOutreachLead.name} via ${outreachChannel}!`);
    setTimeout(() => {
      setOutreachSuccess(null);
      setQuickOutreachLead(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Direct Action Triggers */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <Shield className="h-3 w-3 text-indigo-300" />
              <span>{currentUser.role} Dashboard • {organization.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome back, {currentUser.name} 👋
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              {isAdmin && "Complete administrative overview across all managers, employees, leads, and marketing campaigns."}
              {isManager && `Manager pod view: supervising ${myTeamEmployees.length} team members and ${scopedLeads.length} team leads.`}
              {isEmployee && `Marketing representative view: working with ${scopedLeads.length} assigned leads and active drips.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setQuickLeadModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Quick Add Lead</span>
            </Button>
            <Link href="/contacts/import">
              <Button size="sm" variant="outline" className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
                <UploadCloud className="h-4 w-4 text-sky-400" />
                <span>Import Leads</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. ADMIN DASHBOARD VIEW (PDF Page 4)
         ========================================================================= */}
      {isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Global Agency Performance & Metrics
            </h3>
            <span className="text-xs text-indigo-600 font-bold">Admin Full Governance Mode</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="hover:border-indigo-300 transition-colors">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Total Users</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">{users.length}</p>
                <p className="text-[11px] text-slate-400">{managers.length} Managers • {employees.length} Reps</p>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-300 transition-colors">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Total Leads</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{leads.length}</p>
                <p className="text-[11px] text-slate-400">{leads.filter((l) => l.status === "Interested" || l.status === "Positive").length} Interested</p>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-300 transition-colors">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">WhatsApp Broadcasts</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{totalWhatsAppSent}</p>
                <p className="text-[11px] text-slate-400">Cloud API Delivered</p>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-300 transition-colors">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">SMTP Emails Sent</span>
                <p className="text-2xl font-bold text-sky-600 mt-1">{totalEmailsSent}</p>
                <p className="text-[11px] text-slate-400">Verified Outbound</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Center */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>Team & Pod Governance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Create pod managers, assign sales reps, and view reporting lines.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Link href="/admin/organization">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                    <span>Manage Hierarchy ({users.length} Users)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Permission System</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure custom permissions and employee feature access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Link href="/admin/roles">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                    <span>Permission Matrix</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sky-600" />
                  <span>SMTP & WhatsApp Gateways</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure live API credentials with instant test handshake.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Link href="/admin/settings">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                    <span>Configure Gateways</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MANAGER DASHBOARD VIEW (PDF Pages 14, 15)
         ========================================================================= */}
      {isManager && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pod Overview & Subordinate Performance ({currentUser.name})
            </h3>
            <span className="text-xs text-purple-600 font-bold">Pod Manager View</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">My Team Members</span>
                <p className="text-2xl font-bold text-purple-600 mt-1">{myTeamEmployees.length}</p>
                <p className="text-[11px] text-slate-400">Assigned sales reps</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Team Leads</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{scopedLeads.length}</p>
                <p className="text-[11px] text-slate-400">Total pod pipeline</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Interested Leads</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {scopedLeads.filter((l) => l.status === "Interested" || l.status === "Positive").length}
                </p>
                <p className="text-[11px] text-slate-400">Positive responses</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Converted Wins</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {scopedLeads.filter((l) => l.status === "Converted").length}
                </p>
                <p className="text-[11px] text-slate-400">Closed deals</p>
              </CardContent>
            </Card>
          </div>

          {/* Subordinate Reps Performance Table */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold">My Team Sales Reps</CardTitle>
              <CardDescription className="text-xs">
                Monitor individual employee lead conversion and follow-ups.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {myTeamEmployees.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sales reps assigned to your pod yet. Ask the Main Admin to assign reps to your team.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold dark:bg-slate-900">
                      <th className="p-3 pl-5">Rep Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Assigned Leads</th>
                      <th className="p-3">Interested</th>
                      <th className="p-3">Converted</th>
                      <th className="p-3 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myTeamEmployees.map((emp) => {
                      const empLeads = leads.filter((l) => l.assignedEmployeeId === emp.id);
                      const empInterested = empLeads.filter((l) => l.status === "Interested" || l.status === "Positive").length;
                      const empConverted = empLeads.filter((l) => l.status === "Converted").length;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-5 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                          <td className="p-3 text-slate-500">{emp.email}</td>
                          <td className="p-3 font-semibold">{empLeads.length}</td>
                          <td className="p-3 font-semibold text-emerald-600">{empInterested}</td>
                          <td className="p-3 font-bold text-indigo-600">{empConverted}</td>
                          <td className="p-3 pr-5 text-right">
                            <Link href={`/contacts`}>
                              <Button size="sm" variant="ghost" className="h-7 text-[11px]">View Leads</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================================
          3. DIRECT ACTION & RECENT LEADS QUEUE (Accessible for all roles)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Leads Requiring Follow-up */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  <span>Direct Outreach & Follow-up Queue</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Trigger 1-click WhatsApp or Email outreach directly from your dashboard.
                </CardDescription>
              </div>
              <Link href="/contacts">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  View All ({scopedLeads.length})
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {scopedLeads.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No leads in this workspace yet.</p>
                  <Button size="sm" onClick={() => setQuickLeadModalOpen(true)} className="bg-indigo-600 text-white text-xs">
                    + Add Your First Lead
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scopedLeads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-300">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/contacts/${lead.id}`} className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white">
                              {lead.name}
                            </Link>
                            <Badge
                              variant={
                                lead.status === "Interested" || lead.status === "Positive"
                                  ? "success"
                                  : lead.status === "Converted"
                                  ? "purple"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {lead.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {lead.company || "Individual"} • {lead.whatsApp || lead.phone || lead.email}
                          </p>
                        </div>
                      </div>

                      {/* Direct Outreach Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => openOutreach(lead, "WhatsApp")}
                          className="h-7 px-2 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <Send className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOutreach(lead, "Email")}
                          className="h-7 px-2 text-[11px] font-bold border-sky-300 text-sky-700 hover:bg-sky-50 gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Email</span>
                        </Button>
                        <Link href={`/contacts/${lead.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                            Timeline
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Active Workflows & Quick Campaign Launch */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Active Workflows ({workflows.length})</span>
              </CardTitle>
              <Link href="/automations">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2 text-xs">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between dark:bg-slate-800 dark:border-slate-700"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{wf.name}</p>
                    <p className="text-[10px] text-slate-400">{wf.steps?.length || 0} Steps • {wf.enrolledLeadsCount} Leads</p>
                  </div>
                  <Badge variant={wf.isActive ? "success" : "secondary"} className="text-[10px]">
                    {wf.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Smart Import Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-700 text-white space-y-2 shadow-md">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4" />
              <span>Bulk Lead Import Ready</span>
            </h4>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Drop your customer Excel/CSV sheets. Creates automated lead lists and starts your follow-up workflows.
            </p>
            <Link href="/contacts/import" className="block pt-1">
              <Button size="sm" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs">
                Launch Smart Importer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 1. QUICK ADD LEAD MODAL */}
      <Dialog open={quickLeadModalOpen} onOpenChange={setQuickLeadModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Quick Add Lead</DialogTitle>
            <DialogDescription className="text-xs">
              Add a single contact to start marketing immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuickAddLead} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <Input
                required
                placeholder="e.g. John Smith"
                value={quickLeadName}
                onChange={(e) => setQuickLeadName(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone / WhatsApp *</label>
              <Input
                required
                placeholder="e.g. +91 98765 43210"
                value={quickLeadPhone}
                onChange={(e) => setQuickLeadPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Email</label>
              <Input
                type="email"
                placeholder="e.g. john@company.com"
                value={quickLeadEmail}
                onChange={(e) => setQuickLeadEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company</label>
              <Input
                placeholder="e.g. ABC Technologies"
                value={quickLeadCompany}
                onChange={(e) => setQuickLeadCompany(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setQuickLeadModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Save & Start Outreach
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. DIRECT DASHBOARD OUTREACH MODAL */}
      <Dialog open={!!quickOutreachLead} onOpenChange={() => setQuickOutreachLead(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {outreachChannel === "WhatsApp" ? (
                <Send className="h-4 w-4 text-emerald-600" />
              ) : (
                <Mail className="h-4 w-4 text-sky-600" />
              )}
              <span>Direct {outreachChannel} to {quickOutreachLead?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Personalize and send outreach message directly from dashboard.
            </DialogDescription>
          </DialogHeader>

          {outreachSuccess ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{outreachSuccess}</span>
            </div>
          ) : (
            <div className="space-y-3 pt-2 text-xs">
              <textarea
                rows={5}
                value={outreachMessage}
                onChange={(e) => setOutreachMessage(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950"
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setQuickOutreachLead(null)}>Cancel</Button>
                <Button
                  type="button"
                  onClick={handleSendOutreach}
                  className={outreachChannel === "WhatsApp" ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold" : "bg-sky-600 hover:bg-sky-700 text-white font-bold"}
                >
                  Send {outreachChannel} Now
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

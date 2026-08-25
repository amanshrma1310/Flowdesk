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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

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
  } = useFlowDesk();

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
  const activeFollowupsCount = leads.filter((l) => l.status === "Follow-up").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <Shield className="h-3 w-3 text-indigo-300" />
              <span>{currentUser.role} View • {organization.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome back, {currentUser.name} 👋
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              {isAdmin && "Complete administrative overview across all managers, employees, leads, and marketing campaigns."}
              {isManager && `Team-focused dashboard for your sales pod (${myTeamEmployees.length} assigned employees).`}
              {isEmployee && "Your personal marketing console: manage assigned leads, follow-ups, and outbound campaigns."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/contacts/import">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
                <UploadCloud className="h-4 w-4" />
                <span>Import Leads</span>
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button size="sm" variant="outline" className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
                <Megaphone className="h-4 w-4 text-purple-400" />
                <span>Campaigns</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. ADMIN DASHBOARD (PDF Page 4)
         ========================================================================= */}
      {isAdmin && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Admin Global Overview
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Total Users</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">{users.length}</p>
                <p className="text-[11px] text-slate-400">{managers.length} Mgrs • {employees.length} Emps</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Total Leads</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{leads.length}</p>
                <p className="text-[11px] text-slate-400">All company leads</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
                <p className="text-2xl font-bold text-purple-600 mt-1">{activeCampaigns.length}</p>
                <p className="text-[11px] text-slate-400">{campaigns.length} total campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Emails Sent</span>
                <p className="text-2xl font-bold text-sky-600 mt-1">{totalEmailsSent}</p>
                <p className="text-[11px] text-slate-400">SMTP Outbound</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">WhatsApp Sent</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{totalWhatsAppSent}</p>
                <p className="text-[11px] text-slate-400">Official Cloud API</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Successful Responses</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{totalSuccessfulResponses}</p>
                <p className="text-[11px] text-slate-400">Positive replies</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Active Follow-ups</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">{activeFollowupsCount}</p>
                <p className="text-[11px] text-slate-400">Scheduled steps</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Failed Messages</span>
                <p className="text-2xl font-bold text-rose-600 mt-1">{totalFailedMessages}</p>
                <p className="text-[11px] text-slate-400">Requires retry</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Admin Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:border-indigo-300 transition-colors">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>Manage Users & Teams</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Create managers, add employees, and assign reporting lines.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Link href="/admin/organization">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                    <span>Manage Hierarchy</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-300 transition-colors">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sky-600" />
                  <span>SMTP & WhatsApp APIs</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure and test email credentials and WhatsApp API tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Link href="/admin/settings">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                    <span>Configure Settings</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-300 transition-colors">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span>Reports & Analytics</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Review team performance, conversion rates, and campaign delivery.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <Link href="/analytics">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                    <span>View Reports</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MANAGER DASHBOARD (PDF Pages 14, 15)
         ========================================================================= */}
      {isManager && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Manager Pod Overview ({currentUser.name})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">My Team Members</span>
                <p className="text-2xl font-bold text-purple-600 mt-1">{myTeamEmployees.length}</p>
                <p className="text-[11px] text-slate-400">Assigned Employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Team Leads</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{scopedLeads.length}</p>
                <p className="text-[11px] text-slate-400">Total Pod Leads</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Interested Leads</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {scopedLeads.filter((l) => l.status === "Interested" || l.status === "Positive").length}
                </p>
                <p className="text-[11px] text-slate-400">High buying intent</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Converted Leads</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {scopedLeads.filter((l) => l.status === "Converted").length}
                </p>
                <p className="text-[11px] text-slate-400">Won deals</p>
              </CardContent>
            </Card>
          </div>

          {/* Employee Breakdown */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold">My Team Employees</CardTitle>
              <CardDescription className="text-xs">
                Monitor employee lead counts, follow-ups, and conversions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {myTeamEmployees.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No employees assigned to your pod yet. Ask the Main Admin to assign employees to your team.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myTeamEmployees.map((emp) => {
                    const empLeads = leads.filter((l) => l.assignedEmployeeId === emp.id);
                    const empInterested = empLeads.filter((l) => l.status === "Interested" || l.status === "Positive").length;
                    const empConverted = empLeads.filter((l) => l.status === "Converted").length;

                    return (
                      <div key={emp.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center dark:bg-purple-950 dark:text-purple-300">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</p>
                            <p className="text-[11px] text-slate-400">{emp.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{empLeads.length} Leads</span>
                          <span className="font-semibold text-emerald-600">{empInterested} Interested</span>
                          <span className="font-bold text-indigo-600">{empConverted} Converted</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================================
          3. EMPLOYEE DASHBOARD (PDF Page 15, 20)
         ========================================================================= */}
      {isEmployee && (
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs font-semibold dark:bg-slate-900 dark:border-slate-800">
            <span className="text-slate-500 font-bold mr-1">Quick Actions:</span>
            <Link href="/contacts?action=new">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Lead</span>
              </Button>
            </Link>
            <Link href="/contacts/import">
              <Button size="sm" variant="outline" className="text-xs gap-1 border-indigo-200 text-indigo-700 bg-indigo-50/50">
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import Leads</span>
              </Button>
            </Link>
            <Link href="/campaigns?action=new">
              <Button size="sm" variant="outline" className="text-xs gap-1 border-purple-200 text-purple-700 bg-purple-50/50">
                <Megaphone className="h-3.5 w-3.5" />
                <span>Create Campaign</span>
              </Button>
            </Link>
            <Link href="/templates?action=new">
              <Button size="sm" variant="outline" className="text-xs gap-1 border-sky-200 text-sky-700 bg-sky-50/50">
                <FileText className="h-3.5 w-3.5" />
                <span>Create Template</span>
              </Button>
            </Link>
            <Link href="/automations?action=new">
              <Button size="sm" variant="outline" className="text-xs gap-1 border-amber-200 text-amber-700 bg-amber-50/50">
                <Zap className="h-3.5 w-3.5" />
                <span>Create Workflow</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">My Leads</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">{scopedLeads.length}</p>
                <p className="text-[11px] text-slate-400">Assigned directly to you</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Follow-ups Today</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">{myFollowups.length}</p>
                <p className="text-[11px] text-slate-400">Due for contact</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Interested Leads</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{myInterestedLeads.length}</p>
                <p className="text-[11px] text-slate-400">Positive responses</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Converted Leads</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{myConvertedLeads.length}</p>
                <p className="text-[11px] text-slate-400">Successfully closed</p>
              </CardContent>
            </Card>
          </div>

          {/* My Leads List */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">My Active Leads</CardTitle>
                <CardDescription className="text-xs">Leads you are currently working on.</CardDescription>
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
                  <p className="text-xs text-slate-400">No leads assigned to you yet.</p>
                  <Link href="/contacts/import">
                    <Button size="sm" variant="outline" className="text-xs font-semibold">
                      Import or Add a Lead
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scopedLeads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <Link href={`/contacts/${lead.id}`} className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white">
                          {lead.name}
                        </Link>
                        <p className="text-[11px] text-slate-500">{lead.company || "Individual"} • {lead.phone || lead.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{lead.status}</Badge>
                        <Link href={`/contacts/${lead.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-[11px]">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

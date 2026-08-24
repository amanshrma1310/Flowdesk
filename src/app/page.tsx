"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Clock,
  Calendar,
  MessageSquare,
  Zap,
  ArrowRight,
  TrendingUp,
  UploadCloud,
  CheckCircle2,
  PhoneCall,
  Send,
  Plus,
  Filter,
  Check,
  Building2,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { contacts, tasks, automations, events, deals, currentUser, organization, toggleTaskStatus } = useFlowDesk();
  const [quickFollowupSuccess, setQuickFollowupSuccess] = useState<string | null>(null);

  const hotLeads = contacts.filter((c) => c.leadScore >= 80 || c.tags.some((t) => t.name === "Hot Lead"));
  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const activeAutomations = automations.filter((a) => a.status === "ACTIVE");
  const totalPipeline = deals.reduce((acc, d) => acc + d.value, 0);

  const handleQuickWhatsApp = (contactName: string, id: string) => {
    setQuickFollowupSuccess(id);
    setTimeout(() => setQuickFollowupSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Attention-First "What needs attention today?" */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>Agency: {organization?.name || "FlowDesk AI"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Good Morning, {currentUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {contacts.length === 0
                ? "Your new agency workspace is clean and ready. Import your leads or invite your sales team to get started."
                : `You have ${pendingTasks.length + hotLeads.length} items requiring attention today.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/contacts/import">
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold gap-1.5 shadow-sm">
                <UploadCloud className="h-4 w-4" />
                <span>Smart Import Data</span>
              </Button>
            </Link>
            <Link href="/automations">
              <Button variant="outline" className="text-xs border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Automations ({activeAutomations.length})</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Fresh Agency Setup Checklist if 0 contacts */}
      {contacts.length === 0 && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span>Get Started with {organization?.name || "Your Agency"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete these 3 simple steps to launch your automated marketing machine:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-indigo-100 bg-white space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs dark:bg-indigo-950 dark:text-indigo-400">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Smart Import Contacts</h4>
                <p className="text-[11px] text-slate-500">
                  Drag & drop your Excel/CSV contacts sheet, or scan screenshots.
                </p>
                <Link href="/contacts/import" className="block pt-1">
                  <Button size="sm" className="w-full text-xs font-semibold bg-indigo-600 text-white">
                    Import Excel / CSV
                  </Button>
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-purple-100 bg-white space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xs dark:bg-purple-950 dark:text-purple-400">
                  2
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Add Managers & Reps</h4>
                <p className="text-[11px] text-slate-500">
                  Create sales pods and assign employees under managers.
                </p>
                <Link href="/admin/organization" className="block pt-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold border-purple-200 text-purple-700">
                    Manage Team
                  </Button>
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-white space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs dark:bg-emerald-950 dark:text-emerald-400">
                  3
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Connect Official WhatsApp</h4>
                <p className="text-[11px] text-slate-500">
                  Configure Meta WhatsApp Business Cloud API & SMTP credentials.
                </p>
                <Link href="/admin/settings" className="block pt-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold border-emerald-200 text-emerald-700">
                    Configure APIs
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4 Action Cards: Daily Attention Drivers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hot Leads */}
        <Card className="border-rose-100 bg-rose-50/30 hover:shadow-md transition-shadow dark:border-rose-950 dark:bg-rose-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                Hot Leads
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{hotLeads.length}</p>
              <p className="text-[11px] text-slate-500">High buying intent detected</p>
            </div>
            <Link href="/contacts?filter=hot">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center hover:scale-105 transition-transform dark:bg-rose-900/50 dark:text-rose-300">
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Follow-ups Due */}
        <Card className="border-amber-100 bg-amber-50/30 hover:shadow-md transition-shadow dark:border-amber-950 dark:bg-amber-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Follow-ups Due
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingTasks.length}</p>
              <p className="text-[11px] text-slate-500">Tasks scheduled for today</p>
            </div>
            <Link href="/tasks">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:scale-105 transition-transform dark:bg-amber-900/50 dark:text-amber-300">
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Events Today */}
        <Card className="border-indigo-100 bg-indigo-50/30 hover:shadow-md transition-shadow dark:border-indigo-950 dark:bg-indigo-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Upcoming Events
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}</p>
              <p className="text-[11px] text-slate-500">Automated reminder sequences</p>
            </div>
            <Link href="/events">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center hover:scale-105 transition-transform dark:bg-indigo-900/50 dark:text-indigo-300">
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Unread Conversations */}
        <Card className="border-emerald-100 bg-emerald-50/30 hover:shadow-md transition-shadow dark:border-emerald-950 dark:bg-emerald-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Conversations
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Unified Inbox</p>
              <p className="text-[11px] text-slate-500">WhatsApp & Email replies</p>
            </div>
            <Link href="/conversations">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center hover:scale-105 transition-transform dark:bg-emerald-900/50 dark:text-emerald-300">
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Activity Tracker & Real-Time Action Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Priority Leads & Follow-ups Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Leads Requiring Follow-up */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-500" />
                  <span>High-Priority Leads</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Leads with scores &gt; 80 or high budget requirements
                </CardDescription>
              </div>
              <Link href="/contacts">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700">
                  View All Contacts
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {hotLeads.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No leads imported yet in this agency workspace.</p>
                  <Link href="/contacts/import">
                    <Button size="sm" variant="outline" className="text-xs font-semibold">
                      Import Contacts from Excel
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {hotLeads.slice(0, 4).map((contact) => (
                    <div key={contact.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs dark:bg-slate-800 dark:text-slate-300">
                          {contact.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/contacts/${contact.id}`} className="font-semibold text-sm text-slate-900 hover:text-indigo-600 dark:text-slate-100">
                              {contact.name}
                            </Link>
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              Score {contact.leadScore}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {contact.company || "Direct Lead"} • {contact.location || "India"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {quickFollowupSuccess === contact.id ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickWhatsApp(contact.name, contact.id)}
                            className="text-xs font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 gap-1.5 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </Button>
                        )}
                        <Link href={`/contacts/${contact.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-600">
                            360° Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Follow-up Tasks */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Follow-up Action Items</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Automations and team members created these scheduled tasks
                </CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  Manage All Tasks
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {tasks.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No scheduled tasks pending.</p>
                  <Link href="/tasks">
                    <Button size="sm" variant="outline" className="text-xs font-semibold">
                      Create a Task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 hover:border-indigo-500 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {task.status === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
                        </button>
                        <div>
                          <p className={`text-xs font-semibold ${task.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {task.contactName} ({task.contactCompany}) • Due {task.dueDate}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          task.priority === "URGENT"
                            ? "destructive"
                            : task.priority === "HIGH"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Automation Activity & Pipeline */}
        <div className="space-y-6">
          {/* Active Automations List */}
          <Card className="border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <Zap className="h-4 w-4 text-indigo-600" />
                <span>Active Workflows ({automations.length})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Response-based automation triggers ready for new leads
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2">
              {automations.map((auto) => (
                <Link
                  key={auto.id}
                  href={`/automations/${auto.id}`}
                  className="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-indigo-200 flex items-center justify-between text-xs transition-colors dark:bg-slate-800 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        auto.status === "ACTIVE"
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                    <span className="font-semibold text-slate-800 truncate max-w-[180px] dark:text-slate-200">
                      {auto.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {auto.executionCount} runs
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Quick Smart Import Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-700 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-200" />
              <h3 className="font-bold text-sm">Have new customer data?</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Drop any Excel sheet, business card photo, or screenshot. Our AI will automatically extract columns and start your follow-up workflows.
            </p>
            <Link href="/contacts/import" className="block">
              <Button size="sm" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-xs">
                Launch Smart Importer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

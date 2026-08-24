"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Flame,
  UserCheck,
  Send,
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";
import { LeadStatus } from "@/lib/types";

const STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: "NEW", label: "New Leads", color: "bg-blue-500" },
  { key: "CONTACTED", label: "Contacted", color: "bg-amber-500" },
  { key: "FOLLOW_UP", label: "Follow-up Due", color: "bg-orange-500" },
  { key: "INTERESTED", label: "Interested", color: "bg-purple-500" },
  { key: "QUALIFIED", label: "Qualified / Demo", color: "bg-indigo-500" },
  { key: "CONVERTED", label: "Converted / Won", color: "bg-emerald-500" },
];

export default function LeadsPipelinePage() {
  const { contacts, updateContact } = useFlowDesk();

  const handleMoveStage = (contactId: string, currentStage: LeadStatus, direction: "NEXT" | "PREV") => {
    const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
    if (direction === "NEXT" && currentIndex < STAGES.length - 1) {
      updateContact(contactId, { status: STAGES[currentIndex + 1].key });
    } else if (direction === "PREV" && currentIndex > 0) {
      updateContact(contactId, { status: STAGES[currentIndex - 1].key });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Leads Pipeline & Stages
            </h1>
            <Badge variant="secondary" className="text-xs font-bold">
              {contacts.length} Active Leads
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual Kanban pipeline with automated stage progression and rep ownership.
          </p>
        </div>

        <Link href="/contacts/import">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Import Leads</span>
          </Button>
        </Link>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageContacts = contacts.filter((c) => c.status === stage.key);
          return (
            <div
              key={stage.key}
              className="bg-slate-100/70 rounded-xl p-3 flex flex-col min-w-[220px] dark:bg-slate-900/60 dark:border dark:border-slate-800"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {stage.label}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md shadow-2xs dark:bg-slate-800">
                  {stageContacts.length}
                </span>
              </div>

              {/* Lead Cards */}
              <div className="space-y-2.5 flex-1">
                {stageContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all space-y-2 group dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-bold text-xs text-slate-900 hover:text-indigo-600 transition-colors dark:text-slate-100"
                      >
                        {contact.name}
                      </Link>
                      <Badge
                        variant={contact.leadScore >= 80 ? "destructive" : "secondary"}
                        className="text-[9px] py-0 px-1"
                      >
                        {contact.leadScore}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{contact.company || "Individual"}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-slate-400" />
                        {contact.assignedTo?.name?.split(" ")[0] || "Rahul"}
                      </span>

                      {/* Advance Stage button */}
                      <button
                        onClick={() => handleMoveStage(contact.id, contact.status, "NEXT")}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 opacity-80 group-hover:opacity-100 cursor-pointer"
                        title="Move to next stage"
                      >
                        <span>Move</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {stageContacts.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400 dark:border-slate-800">
                    No leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

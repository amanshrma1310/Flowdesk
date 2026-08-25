"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

export default function LeadResponsesPage() {
  const { responses, leads, markResponseHandled, updateLeadStatus } = useFlowDesk();
  const [filter, setFilter] = useState<"ALL" | "POSITIVE" | "NEGATIVE" | "UNHANDLED">("ALL");

  const filteredResponses = responses.filter((r) => {
    if (filter === "UNHANDLED") return !r.handled;
    if (filter === "POSITIVE") return r.sentiment === "Positive";
    if (filter === "NEGATIVE") return r.sentiment === "Negative";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Responses Inbox
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {responses.length} Responses
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inbound replies from WhatsApp & Email campaigns with automatic sentiment detection (PDF Page 12).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "ALL" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white" : "text-slate-500"
            }`}
          >
            All ({responses.length})
          </button>
          <button
            onClick={() => setFilter("UNHANDLED")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "UNHANDLED" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white" : "text-slate-500"
            }`}
          >
            Pending ({responses.filter((r) => !r.handled).length})
          </button>
          <button
            onClick={() => setFilter("POSITIVE")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "POSITIVE" ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-900" : "text-slate-500"
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilter("NEGATIVE")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "NEGATIVE" ? "bg-white text-rose-600 shadow-xs dark:bg-slate-900" : "text-slate-500"
            }`}
          >
            Negative
          </button>
        </div>
      </div>

      {/* Responses List */}
      {filteredResponses.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No responses recorded yet in this view. When leads reply to WhatsApp or Email campaigns, they will show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredResponses.map((resp) => {
            const lead = leads.find((l) => l.id === resp.leadId);

            return (
              <Card key={resp.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          resp.sentiment === "Positive"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : resp.sentiment === "Negative"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {resp.sentiment === "Positive" ? (
                          <ThumbsUp className="h-4 w-4" />
                        ) : resp.sentiment === "Negative" ? (
                          <ThumbsDown className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/contacts/${resp.leadId}`} className="font-bold text-sm text-slate-900 hover:text-indigo-600 dark:text-white">
                            {resp.leadName}
                          </Link>
                          <Badge
                            variant={resp.channel === "WhatsApp" ? "success" : "default"}
                            className="text-[10px]"
                          >
                            {resp.channel === "WhatsApp" ? <Send className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                            {resp.channel}
                          </Badge>
                          <Badge
                            variant={resp.sentiment === "Positive" ? "success" : resp.sentiment === "Negative" ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {resp.sentiment}
                          </Badge>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                          &quot;{resp.message}&quot;
                        </div>

                        <p className="text-[10px] text-slate-400">
                          Received {resp.timestamp} • Lead Status: <strong>{lead?.status || "Updated"}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!resp.handled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markResponseHandled(resp.id)}
                          className="text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span>Mark Handled</span>
                        </Button>
                      )}
                      <Link href={`/contacts/${resp.leadId}`}>
                        <Button size="sm" className="text-xs h-8 bg-indigo-600 text-white font-semibold">
                          <span>View Profile</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Bot, CheckCircle2, Zap } from "lucide-react";
import { useFlowDesk } from "@/lib/store";
import { useRouter } from "next/navigation";

interface AskAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskAIModal({ open, onOpenChange }: AskAIModalProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const { createAutomation } = useFlowDesk();
  const router = useRouter();

  const handleRunQuery = (customPrompt?: string) => {
    const textToRun = customPrompt || query;
    if (!textToRun.trim()) return;

    setIsLoading(true);
    setAiResult(null);

    setTimeout(() => {
      setIsLoading(false);
      const lower = textToRun.toLowerCase();

      if (lower.includes("punjab") || lower.includes("filter") || lower.includes("hot lead")) {
        setAiResult({
          type: "FILTER",
          title: "Segment Generated: 'Hot Leads from Punjab (Uncontacted > 7 Days)'",
          description: "Matched 14 contacts across Punjab & Haryana territory who haven't received an automated follow-up.",
          actionText: "View Matching Contacts (14)",
          actionRoute: "/contacts?filter=punjab_hot_leads",
        });
      } else if (lower.includes("automation") || lower.includes("follow-up") || lower.includes("workflow")) {
        setAiResult({
          type: "AUTOMATION",
          title: "Generated Automation: 'AI High-Intent Instant Multi-Channel Sequence'",
          description: "New Lead Added ➔ Assign via Round-Robin ➔ Send WhatsApp Greeting ➔ Wait 1 Day ➔ Send Email Deck ➔ High Priority Sales Task.",
          actionText: "Open in Flow Builder",
          actionRoute: "/automations/auto-1",
        });
      } else {
        setAiResult({
          type: "SUMMARY",
          title: "FlowDesk AI Analysis",
          description: `Identified 467 total contacts with 92% deliverable WhatsApp numbers. 37 follow-ups are due this week, with ₹5,35,000 in active negotiation deals.`,
          actionText: "Go to Command Center",
          actionRoute: "/",
        });
      }
    }, 600);
  };

  const samplePrompts = [
    "Show me all hot leads from Punjab who haven't been contacted in 7 days",
    "Create a 4-step follow-up automation for real estate leads",
    "How many WhatsApp messages were delivered today?",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">FlowDesk AI Assistant</DialogTitle>
          </div>
          <DialogDescription className="text-indigo-100 text-xs">
            Ask anything in plain English — build automations, generate filtered segments, or query your CRM data instantly.
          </DialogDescription>
        </div>

        {/* Search Input */}
        <div className="p-5 space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Create a follow-up sequence for newly uploaded leads' or 'Show all hot leads in Mumbai'..."
              className="w-full h-24 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="absolute right-3 bottom-3">
              <Button
                size="sm"
                onClick={() => handleRunQuery()}
                disabled={!query.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              >
                {isLoading ? (
                  <span>Thinking...</span>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run with AI</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Try an example prompt:
            </p>
            <div className="space-y-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleRunQuery(p);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 transition-colors flex items-center justify-between group dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-300"
                >
                  <span className="truncate">{p}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          {aiResult && (
            <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-xl space-y-3 dark:from-indigo-950/30 dark:to-purple-950/30 dark:border-indigo-900/40">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {aiResult.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {aiResult.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(aiResult.actionRoute);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                >
                  <span>{aiResult.actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { Sparkles, Send, Search, Bot } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AskAIModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResponse(`Assistant: You can easily import your contacts into Folders via 'Import Leads', select an Email/WhatsApp template, and launch an automated follow-up campaign from your dashboard.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>AI Assistant</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ask questions about your leads, campaigns, or automations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAsk} className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. How do I send a WhatsApp blast to August leads?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-xs"
            />
            <Button type="submit" size="sm" className="bg-indigo-600 text-white font-semibold">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

          {response && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-200">
              {response}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

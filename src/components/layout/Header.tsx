"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Plus,
  Bell,
  UploadCloud,
  UserPlus,
  Zap,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AskAIModal } from "./AskAIModal";

export function Header() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <>
      <header className="h-15 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 dark:border-slate-800 dark:bg-slate-900">
        {/* Left: Search & Ask AI bar */}
        <div className="flex items-center gap-3 w-96">
          <button
            onClick={() => setIsAiOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 transition-all cursor-pointer dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400 group"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
              <span>Search or &quot;Ask AI...&quot;</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 shadow-2xs dark:bg-slate-900 dark:border-slate-700">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Cmd+K</span>
            </div>
          </button>
        </div>

        {/* Right: Quick Action Buttons & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Smart Import Button */}
          <Link href="/contacts/import">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Smart Import</span>
            </Button>
          </Link>

          {/* New Automation / Contact Dropdown */}
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 font-medium shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New</span>
            </Button>

            {isQuickMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 dark:bg-slate-900 dark:border-slate-800 text-xs"
                onClick={() => setIsQuickMenuOpen(false)}
              >
                <Link
                  href="/contacts/import"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UploadCloud className="h-4 w-4 text-indigo-600" />
                  <span>Import Excel / OCR</span>
                </Link>
                <Link
                  href="/automations/templates"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span>New Automation Flow</span>
                </Link>
                <Link
                  href="/contacts"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  <span>Add Single Contact</span>
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>Schedule Event / Webinar</span>
                </Link>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

          {/* Meta WhatsApp Connection Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WhatsApp API Connected</span>
          </div>

          {/* Notifications */}
          <button className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center relative cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </header>

      {/* Global Ask AI Modal */}
      <AskAIModal open={isAiOpen} onOpenChange={setIsAiOpen} />
    </>
  );
}

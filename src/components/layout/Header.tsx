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
  Menu,
  X,
  Shield,
  Briefcase,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AskAIModal } from "./AskAIModal";
import { useFlowDesk } from "@/lib/store";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { currentUser, switchUserRole } = useFlowDesk();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  return (
    <>
      <header className="h-15 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0 dark:border-slate-800 dark:bg-slate-900 z-30">
        {/* Left: Mobile Menu Toggle & Search */}
        <div className="flex items-center gap-3 w-full max-w-md">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => setIsAiOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 transition-all cursor-pointer dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400 group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
              <span className="truncate">Search or &quot;Ask AI...&quot;</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 shadow-2xs dark:bg-slate-900 dark:border-slate-700 shrink-0">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Cmd+K</span>
            </div>
          </button>
        </div>

        {/* Right: Role Switcher & Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
          {/* Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              {currentUser.role === "MAIN_ADMIN" ? (
                <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : currentUser.role === "MANAGER" ? (
                <Briefcase className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              ) : (
                <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {currentUser.role === "MAIN_ADMIN"
                  ? "Main Admin"
                  : currentUser.role === "MANAGER"
                  ? "Manager (Rahul)"
                  : "Sales Rep (Priya)"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 dark:bg-slate-900 dark:border-slate-800 text-xs"
                onClick={() => setIsRoleMenuOpen(false)}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Switch Active Role View (RBAC Test)
                </p>

                <button
                  onClick={() => switchUserRole("MAIN_ADMIN")}
                  className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 cursor-pointer ${
                    currentUser.role === "MAIN_ADMIN" ? "bg-indigo-50 text-indigo-900 font-bold dark:bg-indigo-950/50 dark:text-indigo-200" : "hover:bg-slate-50"
                  }`}
                >
                  <Shield className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs">Main Admin (Aman Sharma)</p>
                    <p className="text-[10px] text-slate-400 font-normal">Full organization, admin panel, settings & audit logs</p>
                  </div>
                </button>

                <button
                  onClick={() => switchUserRole("MANAGER")}
                  className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 cursor-pointer ${
                    currentUser.role === "MANAGER" ? "bg-purple-50 text-purple-900 font-bold dark:bg-purple-950/50 dark:text-purple-200" : "hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs">Manager (Rahul Kumar)</p>
                    <p className="text-[10px] text-slate-400 font-normal">Sees only North Pod team leads & performance</p>
                  </div>
                </button>

                <button
                  onClick={() => switchUserRole("EMPLOYEE")}
                  className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 cursor-pointer ${
                    currentUser.role === "EMPLOYEE" ? "bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-950/50 dark:text-emerald-200" : "hover:bg-slate-50"
                  }`}
                >
                  <User className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs">Sales Rep (Priya Patel)</p>
                    <p className="text-[10px] text-slate-400 font-normal">Sees only &quot;My Leads&quot;, follow-ups & inbox</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Smart Import Button */}
          <Link href="/contacts/import" className="hidden sm:block">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Smart Import</span>
            </Button>
          </Link>

          {/* Meta WhatsApp Connection Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WhatsApp Connected</span>
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

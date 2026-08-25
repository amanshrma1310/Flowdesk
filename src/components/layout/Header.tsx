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
  CheckCircle2,
  Menu,
  Shield,
  Briefcase,
  User,
  ChevronDown,
  Copy,
  Check,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowDesk } from "@/lib/store";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { currentUser, users, organization, switchUser } = useFlowDesk();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (organization?.joinCode) {
      navigator.clipboard.writeText(organization.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!currentUser) return null;

  return (
    <header className="h-15 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0 dark:border-slate-800 dark:bg-slate-900 z-30">
      {/* Left: Mobile Menu Toggle & Agency Join Code Badge */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {organization && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">
              Agency: <strong className="text-slate-900 dark:text-white">{organization.name}</strong>
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-mono font-bold hover:bg-indigo-100 transition-colors cursor-pointer dark:bg-indigo-950/60 dark:border-indigo-900 dark:text-indigo-300"
              title="Click to copy Agency Join Code for managers & employees"
            >
              <Key className="h-3 w-3 text-indigo-500" />
              <span>Join Code: {organization.joinCode}</span>
              {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 opacity-60" />}
            </button>
          </div>
        )}
      </div>

      {/* Right: User Switcher & Actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* User Switcher Dropdown (Allows switching between Admin, Managers, and Employees created in this agency) */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            {currentUser.role === "ADMIN" ? (
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : currentUser.role === "MANAGER" ? (
              <Briefcase className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            ) : (
              <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700">
              {currentUser.role}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 dark:bg-slate-900 dark:border-slate-800 text-xs"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Active Agency Users ({users.length})
              </p>

              <div className="space-y-1 max-h-56 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`w-full p-2 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                      currentUser.id === u.id
                        ? "bg-indigo-50 text-indigo-900 font-bold dark:bg-indigo-950/50 dark:text-indigo-200"
                        : "hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {u.role === "ADMIN" ? (
                        <Shield className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      ) : u.role === "MANAGER" ? (
                        <Briefcase className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
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
      </div>
    </header>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Megaphone,
  FileText,
  Zap,
  MessageSquare,
  Shield,
  Sliders,
  Mail,
  Send,
  BarChart3,
  LogOut,
  Building2,
  X,
  Plus,
  UploadCloud,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowDesk } from "@/lib/store";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const {
    currentUser,
    organization,
    scopedLeads,
    folders,
    campaigns,
    workflows,
    responses,
    logout,
    resetAll,
  } = useFlowDesk();

  if (!currentUser || !organization) return null;

  const isAdmin = currentUser.role === "ADMIN";
  const isManager = currentUser.role === "MANAGER";

  const unhandledResponses = responses.filter((r) => !r.handled).length;
  const activeWorkflowsCount = workflows.filter((w) => w.isActive).length;

  const mainNavItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    {
      label: isAdmin ? "All Leads" : isManager ? "Team Leads" : "My Leads",
      href: "/contacts",
      icon: Users,
      badge: scopedLeads.length,
    },
    {
      label: "Lead Folders & Lists",
      href: "/contacts/lists",
      icon: FolderKanban,
      badge: folders.length > 0 ? folders.length : undefined,
    },
    {
      label: "Campaigns",
      href: "/campaigns",
      icon: Megaphone,
      badge: campaigns.length > 0 ? campaigns.length : undefined,
    },
    {
      label: "Templates",
      href: "/templates",
      icon: FileText,
    },
    {
      label: "Workflows & Follow-ups",
      href: "/automations",
      icon: Zap,
      badge: activeWorkflowsCount > 0 ? `${activeWorkflowsCount} Active` : undefined,
      badgeVariant: "purple" as const,
    },
    {
      label: "Lead Responses",
      href: "/conversations",
      icon: MessageSquare,
      badge: unhandledResponses > 0 ? `${unhandledResponses} New` : undefined,
      badgeVariant: "success" as const,
    },
  ];

  const adminNavItems = [
    { label: "User Management", href: "/admin/organization", icon: Users },
    { label: "Permission System", href: "/admin/roles", icon: Sliders },
    { label: "SMTP Settings", href: "/admin/settings?tab=smtp", icon: Mail },
    { label: "WhatsApp API Settings", href: "/admin/settings?tab=whatsapp", icon: Send },
    { label: "Reports & Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "w-64 border-r border-slate-200 bg-white flex flex-col h-screen select-none shrink-0 dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 z-50",
          "fixed inset-y-0 left-0 md:static md:translate-x-0",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0 font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block dark:text-white">
                {organization.name}
              </span>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider leading-none mt-0.5">
                Marketing OS
              </p>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="px-3 pt-3">
          <Link
            href="/contacts/import"
            onClick={onCloseMobile}
            className="flex items-center justify-between px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 rounded-lg text-xs font-bold text-indigo-900 transition-colors dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-200"
          >
            <div className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Import Leads (Excel/OCR)</span>
            </div>
            <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">CSV</span>
          </Link>
        </div>

        {/* Main Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      item.badgeVariant === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                      item.badgeVariant === "purple" && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                      !item.badgeVariant && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Panel Section (Only visible for Main Admin) */}
          {isAdmin && (
            <div className="pt-3">
              <div className="px-3 pb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Admin Panel
                </span>
                <Shield className="h-3 w-3 text-indigo-500" />
              </div>
              <div className="space-y-0.5">
                {adminNavItems.map((item) => {
                  const isActive = pathname.startsWith(item.href.split("?")[0]);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 transition-colors",
                            isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Footer Profile & Role */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate dark:text-white">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight truncate">
                {currentUser.role} {currentUser.managerName ? `• Mgr: ${currentUser.managerName}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={resetAll}
              title="Reset Workspace & Start Clean"
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  Megaphone,
  Zap,
  Calendar,
  CheckSquare,
  TrendingUp,
  UserCheck,
  Link2,
  Settings,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowDesk } from "@/lib/store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "purple";
}

export function Sidebar() {
  const pathname = usePathname();
  const { contacts, tasks, automations } = useFlowDesk();

  const activeAutomationsCount = automations.filter((a) => a.status === "ACTIVE").length;
  const pendingTasksCount = tasks.filter((t) => t.status === "PENDING").length;

  const mainNavItems: NavItem[] = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Contacts", href: "/contacts", icon: Users, badge: contacts.length },
    { label: "Leads", href: "/leads", icon: Target },
    { label: "Deals", href: "/deals", icon: BarChart3 },
    { label: "Conversations", href: "/conversations", icon: MessageSquare, badge: "3 New", badgeVariant: "success" },
    { label: "Campaigns", href: "/campaigns", icon: Megaphone },
    { label: "Automations", href: "/automations", icon: Zap, badge: `${activeAutomationsCount} Live`, badgeVariant: "purple" },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Tasks", href: "/tasks", icon: CheckSquare, badge: pendingTasksCount, badgeVariant: "warning" },
    { label: "Analytics", href: "/analytics", icon: TrendingUp },
  ];

  const bottomNavItems: NavItem[] = [
    { label: "Team", href: "/team", icon: UserCheck },
    { label: "Integrations", href: "/integrations", icon: Link2 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen select-none shrink-0 dark:border-slate-800 dark:bg-slate-900">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5 dark:text-white">
              FlowDesk <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded-md dark:bg-indigo-950 dark:text-indigo-300">AI</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">Automation & CRM</p>
          </div>
        </Link>
      </div>

      {/* Quick Smart Import Action Banner */}
      <div className="px-3 pt-3">
        <Link
          href="/contacts/import"
          className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-100/80 rounded-lg text-xs font-semibold text-indigo-900 transition-colors dark:from-indigo-950/40 dark:to-purple-950/40 dark:border-indigo-900/50 dark:text-indigo-200"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Import Anything</span>
          </div>
          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">AI</span>
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
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    item.badgeVariant === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                    item.badgeVariant === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                    item.badgeVariant === "purple" && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                    (!item.badgeVariant || item.badgeVariant === "default") && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 pb-1">
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 px-3" />
        </div>

        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
            </Link>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center">
            AS
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight dark:text-white">Aman Sharma</p>
            <p className="text-[10px] text-slate-400 leading-tight">aman@flowdesk.ai</p>
          </div>
        </div>
        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-300">
          PRO
        </span>
      </div>
    </aside>
  );
}

"use client";

import React, { useState } from "react";
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Activity,
  FileSpreadsheet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

export default function AdminAuditLogsPage() {
  const { auditLogs } = useFlowDesk();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "ALL" || log.entityType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Immutable Security Audit Trail
            </h1>
            <Badge variant="purple" className="text-xs font-bold">Admin Console</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single immutable source of truth tracking user actions, imports, permission modifications, and template approvals.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search audit logs by user, action, or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "LEAD", "TEMPLATE", "SETTINGS", "USER"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {type === "ALL" ? "All Events" : type}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <th className="p-4 pl-5">Timestamp / IP</th>
                <th className="p-4">User & Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4 pr-5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-4 pl-5 font-mono text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{log.timestamp}</p>
                    <p className="text-[10px] text-slate-400">{log.ipAddress || "127.0.0.1"}</p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 font-bold text-[10px] flex items-center justify-center dark:bg-slate-800">
                        {log.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{log.userName}</p>
                        <Badge variant="secondary" className="text-[9px] py-0 px-1">
                          {log.userRole}
                        </Badge>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge variant="purple" className="text-[10px] font-mono">
                      {log.action}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.entityName}
                    </span>
                  </td>

                  <td className="p-4 pr-5 text-slate-600 dark:text-slate-300 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

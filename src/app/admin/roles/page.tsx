"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  Check,
  CheckCircle2,
  Lock,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { PermissionAction } from "@/lib/types";

const ALL_PERMISSION_GROUPS: { group: string; permissions: { key: PermissionAction; label: string }[] }[] = [
  {
    group: "Lead Operations",
    permissions: [
      { key: "LEAD_VIEW_ALL", label: "View All Company Leads" },
      { key: "LEAD_VIEW_TEAM", label: "View Team / Pod Leads" },
      { key: "LEAD_VIEW_OWN", label: "View Only Own Assigned Leads" },
      { key: "LEAD_CREATE", label: "Create Single Lead" },
      { key: "LEAD_IMPORT", label: "Bulk Smart Import (Excel / OCR)" },
      { key: "LEAD_EXPORT", label: "Export Leads to CSV" },
      { key: "LEAD_DELETE", label: "Delete Leads" },
      { key: "LEAD_ASSIGN", label: "Assign Leads to Employees" },
    ],
  },
  {
    group: "Campaigns & Marketing",
    permissions: [
      { key: "CAMPAIGN_CREATE", label: "Create Broadcast Campaigns" },
      { key: "CAMPAIGN_LAUNCH", label: "Launch WhatsApp / Email Broadcasts" },
      { key: "CAMPAIGN_PAUSE", label: "Pause Active Campaigns" },
      { key: "TEMPLATE_CREATE", label: "Create Message Templates" },
      { key: "TEMPLATE_APPROVE", label: "Approve Company-Wide Templates" },
    ],
  },
  {
    group: "No-Code Workflows & Automation",
    permissions: [
      { key: "WORKFLOW_CREATE", label: "Create Visual Workflows" },
      { key: "WORKFLOW_ACTIVATE", label: "Activate Live Automations" },
      { key: "WORKFLOW_PAUSE", label: "Pause Workflow Automations" },
    ],
  },
  {
    group: "Analytics & System",
    permissions: [
      { key: "ANALYTICS_COMPANY", label: "View Company Global Analytics" },
      { key: "ANALYTICS_TEAM", label: "View Team Leaderboards" },
      { key: "ANALYTICS_OWN", label: "View Personal Analytics" },
      { key: "SETTINGS_MANAGE", label: "Manage SMTP / WhatsApp API Keys" },
      { key: "AUDIT_LOG_VIEW", label: "View Security Audit Trail" },
    ],
  },
];

export default function AdminRolesPage() {
  const { customRoles, createCustomRole } = useFlowDesk();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<PermissionAction>>(
    new Set(["LEAD_VIEW_TEAM", "LEAD_CREATE", "LEAD_IMPORT", "CAMPAIGN_CREATE", "TEMPLATE_CREATE"])
  );

  const togglePermission = (key: PermissionAction) => {
    const next = new Set(selectedPerms);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedPerms(next);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    createCustomRole({
      name: roleName,
      description: roleDesc,
      permissions: Array.from(selectedPerms),
    });

    setIsCreateOpen(false);
    setRoleName("");
    setRoleDesc("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Granular Roles & Permission Engine
            </h1>
            <Badge variant="purple" className="text-xs font-bold">RBAC Engine</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Do not hard-code roles — construct precise custom permission matrices for marketing reps, managers, and contractors.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Custom Role</span>
        </Button>
      </div>

      {/* Existing Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customRoles.map((role) => (
          <Card key={role.id} className="hover:border-indigo-300 transition-all flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold">{role.name}</CardTitle>
                </div>
                <Badge variant={role.isSystem ? "secondary" : "purple"} className="text-[10px]">
                  {role.isSystem ? "System Role" : "Custom Role"}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 leading-relaxed">
                {role.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Granted Capabilities ({role.permissions.length}):
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {role.permissions.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md flex items-center gap-1 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {p.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Custom Role Dialog with Permission Matrix */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Build Custom Role Permission Matrix</DialogTitle>
            <DialogDescription className="text-xs">
              Example: &quot;Senior Marketing Rep&quot; with import & campaign rights but without lead export or delete rights.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Role Name *</label>
                <Input
                  required
                  placeholder="e.g. Senior Marketing Employee"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <Input
                  placeholder="e.g. Campaign & template manager"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                />
              </div>
            </div>

            {/* Permission Checkbox Groups */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Permission Checkbox Matrix:
              </p>

              <div className="space-y-4">
                {ALL_PERMISSION_GROUPS.map((group) => (
                  <div key={group.group} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 dark:bg-slate-950 dark:border-slate-800">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {group.group}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {group.permissions.map((p) => {
                        const isChecked = selectedPerms.has(p.key);
                        return (
                          <button
                            type="button"
                            key={p.key}
                            onClick={() => togglePermission(p.key)}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isChecked
                                ? "bg-indigo-50/70 border-indigo-300 text-indigo-900 font-semibold dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded-md border flex items-center justify-center text-white shrink-0 ${
                                isChecked ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3" />}
                            </div>
                            <span className="truncate">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Save & Deploy Custom Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

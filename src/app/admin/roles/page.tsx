"use client";

import React, { useState } from "react";
import {
  Shield,
  Check,
  X,
  Sliders,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

interface PermissionRow {
  key: string;
  name: string;
  admin: "YES";
  manager: "YES" | "LIMITED" | "TEAM_ONLY" | "NO";
  employeeDefault: boolean;
}

const PERMISSION_MATRIX: PermissionRow[] = [
  { key: "dashboard", name: "Dashboard", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "manageUsers", name: "Manage Users", admin: "YES", manager: "LIMITED", employeeDefault: false },
  { key: "manageManagers", name: "Manage Managers", admin: "YES", manager: "NO", employeeDefault: false },
  { key: "manageEmployees", name: "Manage Employees", admin: "YES", manager: "TEAM_ONLY", employeeDefault: false },
  { key: "viewAllLeads", name: "View All Leads", admin: "YES", manager: "NO", employeeDefault: false },
  { key: "viewTeamLeads", name: "View Team Leads", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "addLeads", name: "Add Leads", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "importLeads", name: "Import Leads", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "emailMarketing", name: "Email Marketing", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "whatsAppMarketing", name: "WhatsApp Marketing", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "createTemplates", name: "Create Templates", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "createWorkflows", name: "Create Workflows", admin: "YES", manager: "YES", employeeDefault: true },
  { key: "smtpSettings", name: "SMTP Settings", admin: "YES", manager: "NO", employeeDefault: false },
  { key: "whatsAppSettings", name: "WhatsApp API Settings", admin: "YES", manager: "NO", employeeDefault: false },
  { key: "systemSettings", name: "System Settings", admin: "YES", manager: "NO", employeeDefault: false },
  { key: "reports", name: "Reports", admin: "YES", manager: "TEAM_ONLY", employeeDefault: true },
];

export default function PermissionManagementPage() {
  const { currentUser } = useFlowDesk();
  const [employeePermissions, setEmployeePermissions] = useState<Record<string, boolean>>({
    dashboard: true,
    viewTeamLeads: true,
    addLeads: true,
    importLeads: true,
    emailMarketing: true,
    whatsAppMarketing: true,
    createTemplates: true,
    createWorkflows: true,
    reports: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleEmployeePerm = (key: string) => {
    setEmployeePermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Access Denied. Only the Main Administrator can configure permissions.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Permission Management
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              RBAC Governance
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated permission system allowing Admin to turn employee permissions ON/OFF (PDF Pages 3 & 4).
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Save className="h-4 w-4" />
          <span>Save Permissions</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Permissions matrix updated successfully across all agency users.</span>
        </div>
      )}

      {/* Permission Table matching PDF Page 3 & 4 */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <span>Role & Feature Access Matrix</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Admin has full control. Managers have team access. Employees have permission-based toggles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <th className="p-4 pl-5">Functionality</th>
                <th className="p-4 text-center">Admin</th>
                <th className="p-4 text-center">Manager</th>
                <th className="p-4 text-center">Employee (Permission Based)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PERMISSION_MATRIX.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-4 pl-5 font-semibold text-slate-800 dark:text-slate-200">
                    {row.name}
                  </td>

                  {/* Admin Column */}
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                      ✓
                    </span>
                  </td>

                  {/* Manager Column */}
                  <td className="p-4 text-center">
                    {row.manager === "YES" ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                        ✓
                      </span>
                    ) : row.manager === "LIMITED" ? (
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded dark:bg-purple-950 dark:text-purple-300">
                        Limited
                      </span>
                    ) : row.manager === "TEAM_ONLY" ? (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950 dark:text-indigo-300">
                        Team Only
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-100 text-rose-700 font-bold dark:bg-rose-950 dark:text-rose-300">
                        ✕
                      </span>
                    )}
                  </td>

                  {/* Employee Toggle Column */}
                  <td className="p-4 text-center">
                    {row.admin === "YES" && (row.manager === "NO" || row.key === "manageUsers" || row.key === "manageEmployees" || row.key === "viewAllLeads") ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-100 text-rose-700 font-bold dark:bg-rose-950 dark:text-rose-300">
                        ✕
                      </span>
                    ) : (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!employeePermissions[row.key]}
                          onChange={() => toggleEmployeePerm(row.key)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {employeePermissions[row.key] ? "Allowed" : "Restricted"}
                        </span>
                      </label>
                    )}
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

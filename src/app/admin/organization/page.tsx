"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  User,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Key,
  Copy,
  Check,
  Send,
  SendHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import { User as UserType, SentEmailLog } from "@/lib/types";

export default function OrganizationPage() {
  const {
    organization,
    currentUser,
    users,
    createManager,
    createEmployee,
    assignEmployeeToManager,
    toggleUserActive,
    sentEmailLogs,
  } = useFlowDesk();

  // Create User Modal
  const [isOpen, setIsOpen] = useState(false);
  const [roleToCreate, setRoleToCreate] = useState<"MANAGER" | "EMPLOYEE">("EMPLOYEE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [managerId, setManagerId] = useState("");

  // Post-Creation Credential Modal
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{
    user: UserType;
    tempPassword: string;
    emailLog: SentEmailLog;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const managersList = users.filter((u) => u.role === "MANAGER" && u.isActive);
  const employeesList = users.filter((u) => u.role === "EMPLOYEE");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let res: { user: UserType; tempPassword: string; emailLog: SentEmailLog };
    if (roleToCreate === "MANAGER") {
      res = createManager({ name, email });
    } else {
      res = createEmployee({ name, email, managerId: managerId || undefined });
    }

    setCreatedInfo(res);
    setIsOpen(false);
    setName("");
    setEmail("");
    setManagerId("");
    setCredentialModalOpen(true);
  };

  const copyCredentials = () => {
    if (!createdInfo || !organization) return;
    const text = `FlowDesk AI Login Credentials:\n• Organization: ${organization.name}\n• Agency ID: ${organization.joinCode}\n• Email: ${createdInfo.user.email}\n• Role: ${createdInfo.user.role}\n• Temporary Password: ${createdInfo.tempPassword}\n\nLogin URL: http://localhost:3000`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User & Pod Management
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {users.length} Users
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create managers and marketing reps. Onboarding invitation emails with Agency ID & temporary passwords are automatically dispatched.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setRoleToCreate("MANAGER");
              setIsOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Pod Manager</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setRoleToCreate("EMPLOYEE");
              setIsOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Marketing Rep</span>
          </Button>
        </div>
      </div>

      {/* Agency ID Banner */}
      {organization && (
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Workspace Agency ID (Used for Team Login):</span>
              <strong className="text-lg font-mono font-bold text-white tracking-wide">
                {organization.joinCode}
              </strong>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            <span className="font-semibold">{organization.name}</span> • Main Admin: {organization.adminName}
          </div>
        </div>
      )}

      {/* Users Directory Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>All Team Members</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage active users, reporting lines, and access status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold dark:bg-slate-900">
                <th className="p-3 pl-5">User</th>
                <th className="p-3">Work Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Assigned Manager</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-300">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="p-3">
                    <Badge
                      variant={u.role === "ADMIN" ? "default" : u.role === "MANAGER" ? "purple" : "secondary"}
                      className="text-[10px]"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {u.role === "EMPLOYEE" ? (
                      <select
                        value={u.managerId || ""}
                        onChange={(e) => assignEmployeeToManager(u.id, e.target.value)}
                        className="h-7 rounded border border-slate-200 text-xs px-2 bg-white dark:bg-slate-950"
                      >
                        <option value="">-- No Manager --</option>
                        {managersList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={u.isActive ? "success" : "destructive"} className="text-[10px]">
                      {u.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="p-3 pr-5 text-right">
                    {u.role !== "ADMIN" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserActive(u.id)}
                        className="h-7 text-[11px]"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dispatched Onboarding Emails Log */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Mail className="h-4 w-4 text-sky-600" />
            <span>Onboarding Credentials Dispatch Log</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Audit logs of invitation emails sent to managers and employees with their initial credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {sentEmailLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No user credentials dispatched yet. Add a manager or sales rep above to trigger credential emails.
            </p>
          ) : (
            <div className="space-y-2">
              {sentEmailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs dark:bg-slate-800/60 dark:border-slate-700"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.toName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({log.toEmail})</span>
                      <Badge variant="success" className="text-[10px]">Email Sent ✓</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Agency ID: <strong>{log.agencyId}</strong> • Temp Password: <strong>{log.temporaryPassword}</strong>
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">{log.sentAt}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. CREATE USER MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              <span>Create {roleToCreate === "MANAGER" ? "Pod Manager" : "Marketing Rep"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              System will generate a temporary password and dispatch an invitation email with Agency ID.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <Input
                required
                placeholder="e.g. Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Email *</label>
              <Input
                required
                type="email"
                placeholder="e.g. rahul@apexagency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {roleToCreate === "EMPLOYEE" && managersList.length > 0 && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assign Reporting Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2 bg-white dark:bg-slate-950"
                >
                  <option value="">-- Select Manager --</option>
                  {managersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Generate & Dispatch Credentials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. POST-CREATION CREDENTIAL RECEIPT MODAL */}
      <Dialog open={credentialModalOpen} onOpenChange={setCredentialModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>User Created & Credentials Sent!</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              An onboarding email has been dispatched. You can also copy credentials directly below.
            </DialogDescription>
          </DialogHeader>

          {createdInfo && organization && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono space-y-1.5 border border-slate-800">
                <p className="text-indigo-400 font-bold">FlowDesk AI Login Credentials:</p>
                <p>Agency ID: <strong className="text-white">{organization.joinCode}</strong></p>
                <p>Work Email: <strong className="text-white">{createdInfo.user.email}</strong></p>
                <p>Role: <strong className="text-purple-400">{createdInfo.user.role}</strong></p>
                <p>Temp Password: <strong className="text-emerald-400">{createdInfo.tempPassword}</strong></p>
              </div>

              <Button
                onClick={copyCredentials}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Full Invitation Details"}</span>
              </Button>

              <DialogFooter className="pt-1">
                <Button variant="outline" size="sm" onClick={() => setCredentialModalOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

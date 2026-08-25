"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  User,
  ArrowRight,
  MoreVertical,
  Key,
  CheckCircle2,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function UserManagementPage() {
  const {
    organization,
    currentUser,
    users,
    createManager,
    createEmployee,
    assignEmployeeToManager,
    toggleUserActive,
  } = useFlowDesk();

  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Form states
  const [mgrName, setMgrName] = useState("");
  const [mgrEmail, setMgrEmail] = useState("");

  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empManagerId, setEmpManagerId] = useState("");

  const managers = users.filter((u) => u.role === "MANAGER");
  const employees = users.filter((u) => u.role === "EMPLOYEE");

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgrName.trim() || !mgrEmail.trim()) return;
    createManager({ name: mgrName, email: mgrEmail });
    setIsAddManagerOpen(false);
    setMgrName("");
    setMgrEmail("");
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;
    createEmployee({ name: empName, email: empEmail, managerId: empManagerId || undefined });
    setIsAddEmployeeOpen(false);
    setEmpName("");
    setEmpEmail("");
    setEmpManagerId("");
  };

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Access Denied. Only the Main Administrator can access User & Team Management.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User & Team Management
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {users.length} Total Users
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin hierarchy management: Create managers, create employees, and configure sales pod assignments (PDF Pages 2, 4, 5).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddManagerOpen(true)}
            className="text-xs font-semibold gap-1.5 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>+ Add Manager</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddEmployeeOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Hierarchy Tree Visualization (PDF Page 1 & 5) */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" />
            <span>Agency Reporting Tree</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Managers see only their assigned employees&apos; leads. Employees see only assigned leads.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          {/* Main Admin Node */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs dark:bg-indigo-950/40 dark:border-indigo-900">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <strong className="text-indigo-950 dark:text-indigo-200">Main Admin: {organization?.adminName}</strong>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400">{organization?.adminEmail} • Full Governance</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-800 dark:bg-slate-900 dark:border-slate-700">
              Agency Join Code: {organization?.joinCode}
            </span>
          </div>

          {/* Managers and their Employees */}
          {managers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              No managers added yet. Click &quot;+ Add Manager&quot; to establish your first sales pod.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {managers.map((mgr) => {
                const subEmps = employees.filter((e) => e.managerId === mgr.id);

                return (
                  <div key={mgr.id} className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-3 dark:bg-purple-950/20 dark:border-purple-900">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center dark:bg-purple-950 dark:text-purple-300">
                          {mgr.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Manager: {mgr.name}</p>
                          <p className="text-[10px] text-slate-500">{mgr.email}</p>
                        </div>
                      </div>
                      <Badge variant="purple" className="text-[10px]">
                        {subEmps.length} Employees
                      </Badge>
                    </div>

                    {/* Subordinate Employees (PDF Page 5 Structure) */}
                    <div className="pl-4 space-y-1.5 border-l-2 border-purple-200 dark:border-purple-800 text-xs">
                      {subEmps.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No employees assigned to this manager.</p>
                      ) : (
                        subEmps.map((emp) => (
                          <div key={emp.id} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="font-medium text-slate-800 dark:text-slate-200">{emp.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{emp.email}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Users CRUD Table */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">All User Accounts</CardTitle>
          <CardDescription className="text-xs">
            Edit user roles, change manager assignments, or deactivate accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <th className="p-4 pl-5">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Reporting Manager</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-4 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-100 font-bold text-[11px] flex items-center justify-center text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge
                      variant={u.role === "ADMIN" ? "default" : u.role === "MANAGER" ? "purple" : "secondary"}
                      className="text-[10px]"
                    >
                      {u.role}
                    </Badge>
                  </td>

                  <td className="p-4">
                    {u.role === "EMPLOYEE" ? (
                      <select
                        value={u.managerId || ""}
                        onChange={(e) => assignEmployeeToManager(u.id, e.target.value)}
                        className="h-7 rounded border border-slate-200 text-[11px] px-2 bg-white dark:bg-slate-900"
                      >
                        <option value="">-- No Manager --</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      disabled={u.role === "ADMIN"}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </button>
                  </td>

                  <td className="p-4 pr-5 text-right">
                    {u.role !== "ADMIN" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserActive(u.id)}
                        className="h-7 text-[11px] text-slate-600"
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

      {/* CREATE MANAGER MODAL */}
      <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Pod Manager</DialogTitle>
            <DialogDescription className="text-xs">
              Managers supervise their assigned sales pod and see team leads & campaign reports.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddManager} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Manager Full Name *</label>
              <Input
                required
                placeholder="e.g. Rahul Kumar"
                value={mgrName}
                onChange={(e) => setMgrName(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Email *</label>
              <Input
                required
                type="email"
                placeholder="e.g. rahul@agency.com"
                value={mgrEmail}
                onChange={(e) => setMgrEmail(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddManagerOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Create Manager
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE EMPLOYEE MODAL */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Employee / Sales Rep</DialogTitle>
            <DialogDescription className="text-xs">
              Employees work directly with assigned leads, create templates, and run outreach campaigns.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddEmployee} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Employee Full Name *</label>
              <Input
                required
                placeholder="e.g. Amit Sharma or Neha Gupta"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Email *</label>
              <Input
                required
                type="email"
                placeholder="e.g. amit@agency.com"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assign to Manager (Optional)</label>
              <select
                value={empManagerId}
                onChange={(e) => setEmpManagerId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 bg-white"
              >
                <option value="">-- No Manager Assigned --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Create Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

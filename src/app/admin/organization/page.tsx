"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Briefcase,
  UserPlus,
  Shield,
  CheckCircle2,
  MoreVertical,
  Building,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function AdminOrganizationPage() {
  const { users, currentUser } = useFlowDesk();
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Form states
  const [mgrName, setMgrName] = useState("");
  const [mgrEmail, setMgrEmail] = useState("");
  const [mgrDept, setMgrDept] = useState("");
  const [mgrTerritory, setMgrTerritory] = useState("");

  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("Sales Representative");
  const [empManager, setEmpManager] = useState("Rahul Kumar");

  const managers = users.filter((u) => u.role === "MANAGER");
  const employees = users.filter((u) => u.role === "EMPLOYEE");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Organization Hierarchy & Team Management
            </h1>
            <Badge variant="purple" className="text-xs font-bold">Admin Console</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create managers, assign sales pods, organize employee reporting lines, and control department scopes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddManagerOpen(true)}
            className="text-xs font-semibold gap-1.5 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
          >
            <Briefcase className="h-4 w-4" />
            <span>Add Manager</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddEmployeeOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Managers & Pod Structure */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Sales Pods & Reporting Trees
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managers.map((mgr) => {
            const teamMembers = employees.filter((e) => e.managerName === mgr.name || e.managerId === mgr.id);
            return (
              <Card key={mgr.id} className="border-purple-100 dark:border-purple-950">
                <CardHeader className="p-5 pb-3 bg-purple-50/40 border-b border-purple-100 dark:bg-purple-950/20 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {mgr.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                          Manager: {mgr.name}
                        </CardTitle>
                        <CardDescription className="text-xs">{mgr.department} • {mgr.territory}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="purple" className="text-[10px]">
                      {teamMembers.length} Employees
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-3 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Pod Employees:
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teamMembers.map((emp) => (
                      <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center dark:bg-slate-800 dark:text-slate-300">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</p>
                            <p className="text-[10px] text-slate-400">{emp.customRoleName || emp.role}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-semibold">{emp.activeLeadsCount || 24} Leads</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Manager Dialog */}
      <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add New Pod Manager</DialogTitle>
            <DialogDescription className="text-xs">Create a manager who will oversee a dedicated sales pod.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <Input placeholder="e.g. Rahul Kumar" value={mgrName} onChange={(e) => setMgrName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Work Email</label>
              <Input placeholder="e.g. rahul@flowdesk.ai" value={mgrEmail} onChange={(e) => setMgrEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Department / Pod</label>
              <Input placeholder="e.g. North Sales Pod" value={mgrDept} onChange={(e) => setMgrDept(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Territory</label>
              <Input placeholder="e.g. Punjab, Delhi NCR" value={mgrTerritory} onChange={(e) => setMgrTerritory(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setIsAddManagerOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddManagerOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Create Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Employee to Sales Pod</DialogTitle>
            <DialogDescription className="text-xs">Assign reporting manager and role permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Employee Name</label>
              <Input placeholder="e.g. Priya Patel" value={empName} onChange={(e) => setEmpName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
              <Input placeholder="e.g. priya@flowdesk.ai" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reporting Manager</label>
              <select
                value={empManager}
                onChange={(e) => setEmpManager(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-3 bg-white"
              >
                {managers.map((m) => (
                  <option key={m.id} value={m.name}>{m.name} ({m.department})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddEmployeeOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

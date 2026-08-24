"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Check,
  Clock,
  UserCheck,
  Building,
  Flame,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function TasksPage() {
  const { tasks, toggleTaskStatus, addTask, contacts } = useFlowDesk();
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("Today, 05:00 PM");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("HIGH");
  const [selectedContactName, setSelectedContactName] = useState(contacts[0]?.name || "John Smith");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      contactName: selectedContactName,
      contactCompany: "Direct Lead",
      dueDate: taskDueDate,
      priority: taskPriority,
    });

    setIsNewTaskOpen(false);
    setTaskTitle("");
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedFilter === "PENDING") return t.status === "PENDING";
    if (selectedFilter === "COMPLETED") return t.status === "COMPLETED";
    if (selectedFilter === "HIGH") return t.priority === "HIGH" || t.priority === "URGENT";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team Tasks & Follow-up Actions
            </h1>
            <Badge variant="warning" className="text-xs font-bold">
              {pendingCount} Due Today
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated follow-up tasks created by visual workflows and team members.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsNewTaskOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "All Tasks" },
          { key: "PENDING", label: `Pending (${pendingCount})` },
          { key: "HIGH", label: "High / Urgent Priority" },
          { key: "COMPLETED", label: "Completed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === f.key
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    task.status === "COMPLETED"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-300 hover:border-indigo-500 bg-white dark:bg-slate-800"
                  }`}
                >
                  {task.status === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
                </button>

                <div className="space-y-0.5">
                  <p
                    className={`text-xs font-bold ${
                      task.status === "COMPLETED"
                        ? "line-through text-slate-400"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    {task.contactName && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {task.contactName} {task.contactCompany ? `(${task.contactCompany})` : ""}
                      </span>
                    )}
                    <span>• Due {task.dueDate}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 hidden sm:flex">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>{task.assignedToName || "Rahul Kumar"}</span>
                </div>

                <Badge
                  variant={
                    task.priority === "URGENT"
                      ? "destructive"
                      : task.priority === "HIGH"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Follow-up Task</DialogTitle>
            <DialogDescription className="text-xs">Schedule an action item for a sales rep.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Task Description
              </label>
              <Input
                required
                placeholder="e.g. Call client to discuss customized proposal"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Related Contact
              </label>
              <Input
                value={selectedContactName}
                onChange={(e) => setSelectedContactName(e.target.value)}
                placeholder="e.g. John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Due Time
                </label>
                <Input
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full h-9.5 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:bg-slate-950 dark:border-slate-800"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

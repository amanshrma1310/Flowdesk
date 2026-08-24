"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Users,
  UploadCloud,
  Zap,
  Calendar,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function LeadListsPage() {
  const { leadLists, createLeadList, automations } = useFlowDesk();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [listDesc, setListDesc] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    createLeadList(listName, listDesc);
    setIsCreateOpen(false);
    setListName("");
    setListDesc("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Folders & Lists
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {leadLists.length} Folders
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize bulk imports and marketing audiences into isolated folders with dedicated automations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/contacts/import">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300">
              <UploadCloud className="h-4 w-4" />
              <span>Import to List</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Folder</span>
          </Button>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadLists.map((list) => (
          <Card key={list.id} className="hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-xs font-bold">
                  {list.leadCount} Leads
                </Badge>
              </div>

              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {list.name}
              </CardTitle>
              {list.description && (
                <CardDescription className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {list.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-[11px] text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                <p className="flex items-center justify-between">
                  <span>Created by:</span>
                  <strong className="text-slate-700 dark:text-slate-300">{list.createdByName}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Source:</span>
                  <span className="font-semibold text-indigo-600">{list.source}</span>
                </p>
                {list.assignedWorkflowName && (
                  <p className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-1 text-purple-600 font-semibold">
                      <Zap className="h-3 w-3" /> Active Flow:
                    </span>
                    <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-300">{list.assignedWorkflowName}</span>
                  </p>
                )}
              </div>

              <Link href={`/contacts?list=${list.id}`}>
                <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1.5">
                  <span>View Leads in Folder</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create List Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create New Lead Folder / List</DialogTitle>
            <DialogDescription className="text-xs">
              Organize upcoming marketing campaigns and exhibition inquiries into a named folder.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Folder Name *
              </label>
              <Input
                required
                placeholder="e.g. Real Estate Leads – Punjab"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Description
              </label>
              <textarea
                placeholder="e.g. Inquiries collected from August exhibition in Ludhiana..."
                value={listDesc}
                onChange={(e) => setListDesc(e.target.value)}
                className="w-full h-20 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Users,
  UploadCloud,
  Megaphone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function LeadListsPage() {
  const { folders, createFolder, leads } = useFlowDesk();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    createFolder(folderName);
    setIsCreateOpen(false);
    setFolderName("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Folders & Lists
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {folders.length} Folders
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize bulk uploads by source (e.g. Facebook Leads - August, Exhibition Leads) and target entire lists for marketing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/contacts/import">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100">
              <UploadCloud className="h-4 w-4" />
              <span>Import to Folder</span>
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

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <FolderKanban className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No lead folders created yet. Upload an Excel sheet to auto-create a folder or create one manually.
            </p>
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 text-white text-xs">
                Create Folder
              </Button>
              <Link href="/contacts/import">
                <Button size="sm" variant="outline" className="text-xs">
                  Import Spreadsheet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => {
            const folderLeads = leads.filter((l) => l.folderId === folder.id);
            const newCount = folderLeads.filter((l) => l.status === "New").length;
            const contactedCount = folderLeads.filter((l) => l.status === "Contacted").length;
            const interestedCount = folderLeads.filter((l) => l.status === "Interested" || l.status === "Positive").length;
            const notInterestedCount = folderLeads.filter((l) => l.status === "Not Interested" || l.status === "Negative").length;
            const convertedCount = folderLeads.filter((l) => l.status === "Converted").length;

            return (
              <Card key={folder.id} className="hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {folderLeads.length} Total Leads
                    </Badge>
                  </div>

                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {folder.name}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-400">
                    Created by {folder.createdByName} • {folder.createdAt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3 text-xs">
                  {/* Status Breakdown Table matching PDF Page 7 */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px] dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">New:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{newCount}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Contacted:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{contactedCount}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Interested:</span>
                      <strong className="text-emerald-600">{interestedCount}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Not Interested:</span>
                      <strong className="text-rose-600">{notInterestedCount}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Converted:</span>
                      <strong className="text-indigo-600 font-bold">{convertedCount}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Link href={`/campaigns?folderId=${folder.id}`}>
                      <Button size="sm" className="w-full text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                        <Megaphone className="h-3.5 w-3.5" />
                        <span>Select Entire List for Campaign</span>
                      </Button>
                    </Link>
                    <Link href={`/contacts?folder=${folder.id}`}>
                      <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1">
                        <span>View Leads</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Lead Folder / List</DialogTitle>
            <DialogDescription className="text-xs">
              Examples: &quot;Facebook Leads - August&quot;, &quot;Google Leads - August&quot;, &quot;Exhibition Leads&quot;, &quot;Website Leads&quot;.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Folder Name *</label>
              <Input
                required
                placeholder="e.g. Facebook Leads - August 2026"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
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

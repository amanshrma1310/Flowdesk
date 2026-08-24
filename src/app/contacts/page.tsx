"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  UploadCloud,
  Send,
  MoreVertical,
  Flame,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Phone,
  Mail,
  Building,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";

export default function ContactsPage() {
  const { contacts, addContact, deleteContact, sendMessage } = useFlowDesk();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickSentId, setQuickSentId] = useState<string | null>(null);

  // New Contact Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addContact({
      name: newName,
      phone: newPhone,
      email: newEmail,
      company: newCompany,
      status: "NEW",
      leadScore: 75,
      tags: [{ id: `tag-${Date.now()}`, name: newInterest || "Hot Lead", color: "#EF4444" }],
    });

    setIsAddModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewCompany("");
    setNewInterest("");
  };

  const handleQuickWhatsApp = (contactId: string, name: string) => {
    sendMessage(contactId, `Hi ${name} 👋 Thanks for connecting with FlowDesk AI! How can we help your business today?`, "WHATSAPP");
    setQuickSentId(contactId);
    setTimeout(() => setQuickSentId(null), 3000);
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery));

    const matchesTag =
      selectedTag === "ALL" || c.tags.some((t) => t.name.toLowerCase() === selectedTag.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || c.status === selectedStatus;

    return matchesSearch && matchesTag && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Profiles & Contacts
            </h1>
            <Badge variant="secondary" className="text-xs font-bold">
              {contacts.length} Total
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified 360° customer directory with auto-normalized phones and activity logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/contacts/import">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300">
              <UploadCloud className="h-4 w-4" />
              <span>Smart Import</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by name, company, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Quick Tag Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {["ALL", "Hot Lead", "Website", "Real Estate", "Enterprise", "Customer"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    selectedTag === tag
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {tag === "Hot Lead" && <Flame className="h-3 w-3 inline mr-1 text-rose-300" />}
                  {tag === "ALL" ? "All Tags" : tag}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <th className="p-4 pl-5">Customer / Company</th>
                <th className="p-4">Phone / WhatsApp</th>
                <th className="p-4">Lead Score</th>
                <th className="p-4">Assigned Rep</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5 dark:text-slate-100"
                          >
                            <span>{contact.name}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400" />
                          </Link>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="h-3 w-3" />
                            <span>{contact.company || "Individual"}</span>
                            {contact.email && <span>• {contact.email}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-slate-700 font-medium dark:text-slate-300">
                        {contact.phone || "—"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            contact.leadScore >= 80
                              ? "bg-rose-500"
                              : contact.leadScore >= 60
                              ? "bg-amber-500"
                              : "bg-slate-300"
                          }`}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {contact.leadScore}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>{contact.ownerName || "Unassigned"}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {contact.tags.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          contact.status === "CONVERTED"
                            ? "success"
                            : contact.status === "INTERESTED"
                            ? "purple"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {contact.status}
                      </Badge>
                    </td>

                    <td className="p-4 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {quickSentId === contact.id ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickWhatsApp(contact.id, contact.name)}
                            className="h-7 px-2 text-[11px] border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </Button>
                        )}
                        <Link href={`/contacts/${contact.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                            360°
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Single Contact Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add New Contact</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new customer profile manually with instant lead assignment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <Input
                required
                placeholder="e.g. John Smith"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone / WhatsApp Number
              </label>
              <Input
                placeholder="e.g. +91 98765 43210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="e.g. john@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Company / Organization
              </label>
              <Input
                placeholder="e.g. ABC Technologies"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Product Interest / Tag
              </label>
              <Input
                placeholder="e.g. Website, CRM, Real Estate"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Create & Assign Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

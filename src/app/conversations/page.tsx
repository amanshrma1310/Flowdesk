"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Mail,
  Search,
  CheckCheck,
  Phone,
  Flame,
  UserCheck,
  Building,
  Sparkles,
  Paperclip,
  Smile,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";
import { ChatMessage } from "@/lib/types";

export default function ConversationsPage() {
  const { contacts, chats, sendMessage } = useFlowDesk();
  const [selectedContactId, setSelectedContactId] = useState<string>("cont-1");
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");

  const activeContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const activeMessages = chats[selectedContactId] || [
    {
      id: "msg-default-1",
      contactId: selectedContactId,
      channel: "WHATSAPP",
      direction: "OUTBOUND",
      status: "READ",
      senderName: "FlowDesk AI",
      content: `Hi ${activeContact?.name?.split(" ")[0] || "there"} 👋 Thanks for connecting! We are reviewing your requirements.`,
      timestamp: "Today, 09:30 AM",
    },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    sendMessage(activeContact.id, inputMessage, selectedChannel);
    setInputMessage("");
  };

  const quickTemplates = [
    "Hi {{name}} 👋 Just following up on our proposal. Do you have 10 mins today?",
    "Thanks for confirming! Here is the meeting link: zoom.us/j/flowdesk",
    "We have customized the quote as requested. Let me know if you would like to proceed.",
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-6">
      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Conversations List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 dark:bg-slate-900 dark:border-slate-800">
          <div className="p-3.5 border-b border-slate-200 space-y-2 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Unified Inbox</span>
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                Official WhatsApp & Email
              </span>
            </div>
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          {/* Conversations Thread Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {contacts.map((c) => {
              const isSelected = c.id === selectedContactId;
              const contactChat = chats[c.id];
              const lastMsg = contactChat ? contactChat[contactChat.length - 1] : null;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContactId(c.id)}
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/70 border-l-4 border-indigo-600 dark:bg-indigo-950/40"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate dark:text-slate-100">
                        {c.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {lastMsg ? lastMsg.timestamp.replace("Today, ", "") : "09:30 AM"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5 dark:text-slate-400">
                      {lastMsg ? lastMsg.content : "Inquiry regarding CRM automation..."}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        WhatsApp
                      </span>
                      {c.company && (
                        <span className="text-[10px] text-slate-400 truncate">
                          {c.company}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Active Chat Messages Window */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950">
          {/* Chat Header */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center">
                {activeContact?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeContact?.name}</span>
                  <span className="text-[10px] text-emerald-600 font-normal">● Online</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  {activeContact?.phone} • {activeContact?.company}
                </p>
              </div>
            </div>

            {/* Channel Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg dark:bg-slate-800">
              <button
                onClick={() => setSelectedChannel("WHATSAPP")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedChannel === "WHATSAPP"
                    ? "bg-white text-emerald-700 shadow-2xs font-bold dark:bg-slate-900 dark:text-emerald-300"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Send className="h-3 w-3 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedChannel("EMAIL")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedChannel === "EMAIL"
                    ? "bg-white text-sky-700 shadow-2xs font-bold dark:bg-slate-900 dark:text-sky-300"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Mail className="h-3 w-3 text-sky-600" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeMessages.map((msg) => {
              const isOutbound = msg.direction === "OUTBOUND";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isOutbound
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                        isOutbound ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isOutbound && <CheckCheck className="h-3 w-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Presets Bar */}
          <div className="px-6 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 dark:bg-slate-900/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Quick Reply:
            </span>
            {quickTemplates.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setInputMessage(t.replace("{{name}}", activeContact?.name?.split(" ")[0] || "there"))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors shrink-0 truncate max-w-[240px] cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                {t.replace("{{name}}", activeContact?.name?.split(" ")[0] || "")}
              </button>
            ))}
          </div>

          {/* Chat Composer Input */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0 dark:bg-slate-900 dark:border-slate-800"
          >
            <Input
              placeholder={`Send official ${selectedChannel === "WHATSAPP" ? "WhatsApp message" : "email"} to ${activeContact?.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs h-10"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputMessage.trim()}
              className={`${
                selectedChannel === "WHATSAPP"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-sky-600 hover:bg-sky-700"
              } text-white font-bold h-10 px-4`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Column 3: 360 Customer Profile Sidebar */}
        <div className="w-72 bg-white border-l border-slate-200 p-5 space-y-4 overflow-y-auto shrink-0 hidden xl:block dark:bg-slate-900 dark:border-slate-800">
          <div className="text-center space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-sm">
              {activeContact?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeContact?.name}</h4>
              <p className="text-[11px] text-slate-400">{activeContact?.company}</p>
            </div>
            <div className="flex justify-center gap-1.5">
              <Badge variant="destructive" className="text-[10px]">
                <Flame className="h-3 w-3 mr-1" /> Score {activeContact?.leadScore}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {activeContact?.status}
              </Badge>
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Rep</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                {activeContact?.assignedTo?.name || "Rahul Kumar"}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Phone (E.164)</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{activeContact?.phone}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{activeContact?.email || "—"}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeContact?.tags.map((t) => (
                  <span key={t.id} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link href={`/contacts/${activeContact?.id}`}>
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold gap-1">
                <span>View Complete 360° Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

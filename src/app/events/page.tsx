"use client";

import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Users,
  Video,
  Clock,
  Send,
  Mail,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function EventsPage() {
  const { events } = useFlowDesk();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Events & Webinar Automations
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {events.length} Upcoming Events
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated event lifecycle: WhatsApp confirmation passes, 2-day/2-hour reminders, and post-event feedback surveys.
          </p>
        </div>

        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events.map((evt) => (
          <Card key={evt.id} className="overflow-hidden border-indigo-100 dark:border-slate-800">
            <div className="bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/30 p-6 border-b border-slate-100 dark:from-indigo-950/20 dark:to-slate-900 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[10px]">
                      {evt.type}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      {formatDate(evt.eventDate)} at 03:00 PM IST
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{evt.title}</h3>
                  <p className="text-xs text-slate-500 max-w-2xl">{evt.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs font-semibold gap-1">
                    <Video className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Join Link</span>
                  </Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
                    Manage Attendees ({evt.registeredCount})
                  </Button>
                </div>
              </div>
            </div>

            {/* Event Automation Workflow Pipeline */}
            <CardContent className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-purple-600" />
                <span>Active 5-Step Reminder Sequence</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1 dark:bg-emerald-950/30 dark:border-emerald-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Send className="h-3.5 w-3.5 text-emerald-600" />
                    <span>1. Instant Pass</span>
                  </div>
                  <p className="text-[11px] text-slate-500">WhatsApp QR ticket sent upon signup.</p>
                </div>

                <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1 dark:bg-sky-950/30 dark:border-sky-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300">
                    <Mail className="h-3.5 w-3.5 text-sky-600" />
                    <span>2. Calendar Invite</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Google / Outlook .ics calendar email.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span>3. 2 Days Before</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Preparation kit & speaker intro.</p>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 dark:bg-amber-950/30 dark:border-amber-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Send className="h-3.5 w-3.5 text-amber-600" />
                    <span>4. 2h Urgent Alert</span>
                  </div>
                  <p className="text-[11px] text-slate-500">1-tap WhatsApp direct meeting link.</p>
                </div>

                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1 dark:bg-purple-950/30 dark:border-purple-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                    <span>5. Post-Event NPS</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Feedback survey & session recording.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

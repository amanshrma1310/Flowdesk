"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Send,
  Mail,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  MousePointer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlowDesk } from "@/lib/store";
import confetti from "canvas-confetti";

export default function CampaignsPage() {
  const { campaigns } = useFlowDesk();
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [campName, setCampName] = useState("");
  const [campChannel, setCampChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [campSegment, setCampSegment] = useState("Hot Leads + Real Estate");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewCampaignOpen(false);
    setBroadcastSuccess(true);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Multi-Channel Broadcast Campaigns
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {campaigns.length} Campaigns
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast personalized WhatsApp & email campaigns to filtered smart segments.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsNewCampaignOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
      </div>

      {broadcastSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Campaign broadcast queued into BullMQ queue! Messages are being dispatched with rate-limiting.</span>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{camp.name}</h3>
                    <Badge
                      variant={camp.channel === "WHATSAPP" ? "success" : "default"}
                      className="text-[10px]"
                    >
                      {camp.channel === "WHATSAPP" ? (
                        <Send className="h-3 w-3 mr-1" />
                      ) : (
                        <Mail className="h-3 w-3 mr-1" />
                      )}
                      {camp.channel}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {camp.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-indigo-500" />
                    <span>Segment: <strong className="text-slate-700 dark:text-slate-300">{camp.segmentName}</strong></span>
                  </p>
                </div>

                {/* Delivery & Read Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Recipients</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">{camp.totalRecipients.toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] text-emerald-600 block uppercase font-bold">Delivered</span>
                    <span className="text-base font-bold text-emerald-600">{camp.deliveredCount.toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] text-sky-600 block uppercase font-bold">Read Rate</span>
                    <span className="text-base font-bold text-sky-600">
                      {camp.sentCount > 0 ? `${Math.round((camp.readCount / camp.sentCount) * 100)}%` : "—"}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] text-purple-600 block uppercase font-bold">Clicks</span>
                    <span className="text-base font-bold text-purple-600">{camp.clickedCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Campaign Modal */}
      <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Broadcast Campaign</DialogTitle>
            <DialogDescription className="text-xs">
              Broadcast messages to your contacts based on automated smart filters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLaunchCampaign} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Campaign Name
              </label>
              <Input
                required
                placeholder="e.g. Diwali Flash Special Offer"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Broadcast Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCampChannel("WHATSAPP")}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    campChannel === "WHATSAPP"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp API</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCampChannel("EMAIL")}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    campChannel === "EMAIL"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 text-sky-600" />
                  <span>Email Broadcast</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Smart Audience Segment
              </label>
              <Input
                value={campSegment}
                onChange={(e) => setCampSegment(e.target.value)}
                placeholder="e.g. Lead Score > 70 AND Location = India"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Broadcast Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

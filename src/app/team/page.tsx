"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Plus,
  Shield,
  MapPin,
  Flame,
  Zap,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";

export default function TeamPage() {
  const { users } = useFlowDesk();
  const [activeTab, setActiveTab] = useState<"MEMBERS" | "ASSIGNMENT">("MEMBERS");
  const [distributionMode, setDistributionMode] = useState<"ROUND_ROBIN" | "TERRITORY" | "SCORE">("ROUND_ROBIN");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team & Smart Lead Distribution
            </h1>
            <Badge variant="purple" className="text-xs font-bold">
              {users.length} Active Members
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, roles, and automated lead routing algorithms.
          </p>
        </div>

        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("MEMBERS")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "MEMBERS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Team Members & Roles
        </button>
        <button
          onClick={() => setActiveTab("ASSIGNMENT")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "ASSIGNMENT"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Smart Routing Rules (Round-Robin & Territory)
        </button>
      </div>

      {/* Tab 1: Team Members */}
      {activeTab === "MEMBERS" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{member.name}</h4>
                        <Badge variant="secondary" className="text-[10px]">
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    {member.territory && (
                      <div className="hidden sm:block text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Territory</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{member.territory}</span>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Active Leads</span>
                      <span className="font-bold text-indigo-600">{member.activeLeadsCount || 24} Leads</span>
                    </div>

                    <Button size="sm" variant="ghost" className="text-xs">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Smart Routing Rules */}
      {activeTab === "ASSIGNMENT" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-600" />
                <span>Automated Lead Distribution Engine</span>
              </CardTitle>
              <CardDescription className="text-xs">
                When new contacts are imported or captured from forms, FlowDesk instantly assigns them without manual sorting.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {/* Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setDistributionMode("ROUND_ROBIN")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    distributionMode === "ROUND_ROBIN"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:bg-indigo-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">1. Round-Robin</span>
                    <Badge variant="success" className="text-[9px]">Default</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Even distribution across all active sales reps (Lead 1 ➔ Rahul, Lead 2 ➔ Priya, Lead 3 ➔ Aman).
                  </p>
                </button>

                <button
                  onClick={() => setDistributionMode("TERRITORY")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    distributionMode === "TERRITORY"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:bg-indigo-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">2. Territory / Location</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Route Punjab leads ➔ Rahul, Delhi NCR ➔ Priya, International ➔ Sarah.
                  </p>
                </button>

                <button
                  onClick={() => setDistributionMode("SCORE")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    distributionMode === "SCORE"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:bg-indigo-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">3. Lead Score / Value</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    High intent leads (Score &gt; 80) route directly to Senior Account Execs.
                  </p>
                </button>
              </div>

              {/* Active Territory Mapping Rules */}
              {distributionMode === "TERRITORY" && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 dark:bg-slate-900 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Active Territory Assignment Rules:
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                      <span>Location contains <strong>Punjab, Haryana, Chandigarh</strong></span>
                      <span className="font-bold text-indigo-600">Assign to Rahul Kumar</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                      <span>Location contains <strong>Delhi NCR, Gurugram, Noida</strong></span>
                      <span className="font-bold text-indigo-600">Assign to Priya Patel</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                      <span>Location contains <strong>USA, UK, International</strong></span>
                      <span className="font-bold text-indigo-600">Assign to Sarah Wilson</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

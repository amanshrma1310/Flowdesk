"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Plus,
  DollarSign,
  TrendingUp,
  Building,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowDesk } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const DEAL_STAGES = [
  { key: "DISCOVERY", label: "Discovery / Inquiry", color: "bg-blue-500" },
  { key: "PROPOSAL", label: "Proposal Sent", color: "bg-purple-500" },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-amber-500" },
  { key: "WON", label: "Won / Closed", color: "bg-emerald-500" },
];

export default function DealsPage() {
  const { deals, updateDealStage } = useFlowDesk();

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);
  const weightedValue = deals.reduce((acc, d) => acc + (d.value * d.probability) / 100, 0);
  const wonValue = deals.filter((d) => d.stage === "WON").reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Deals & Revenue Pipeline
            </h1>
            <Badge variant="success" className="text-xs font-bold">
              {formatCurrency(totalValue)} Pipeline
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track deal progress, weighted revenue forecasts, and close probabilities.
          </p>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-indigo-100 bg-indigo-50/20 dark:border-indigo-950 dark:bg-indigo-950/20">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider dark:text-indigo-300">
              Total Active Pipeline
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">{formatCurrency(totalValue)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{deals.length} active opportunities</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/20 dark:border-purple-950 dark:bg-purple-950/20">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider dark:text-purple-300">
              Weighted Forecast
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1 dark:text-purple-300">{formatCurrency(weightedValue)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Probability-adjusted revenue</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/20">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
              Closed Won Deals
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(wonValue)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">100% conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Deals Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const stageSum = stageDeals.reduce((acc, d) => acc + d.value, 0);

          return (
            <div key={stage.key} className="bg-slate-100/70 rounded-xl p-3.5 space-y-3 dark:bg-slate-900/60 dark:border dark:border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{stage.label}</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs dark:bg-slate-800 dark:text-indigo-300">
                  {formatCurrency(stageSum)}
                </span>
              </div>

              <div className="space-y-2.5">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} className="p-3.5 shadow-2xs hover:shadow-xs transition-shadow space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{deal.title}</h4>
                      <Badge variant="default" className="text-[10px]">
                        {deal.probability}%
                      </Badge>
                    </div>

                    <p className="text-base font-bold text-emerald-600">{formatCurrency(deal.value)}</p>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <p className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-400" />
                        <span>{deal.company}</span>
                      </p>
                      <p className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>Close: {deal.expectedCloseDate}</span>
                      </p>
                    </div>
                  </Card>
                ))}

                {stageDeals.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400 dark:border-slate-800">
                    No deals in stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

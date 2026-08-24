"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Shield,
  Send,
  Globe,
  Briefcase,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

export function AdminOnboardingModal() {
  const { login, createAgency } = useFlowDesk();

  const [step, setStep] = useState<1 | 2>(1);

  // Admin Account Details
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Agency Details
  const [agencyName, setAgencyName] = useState("");
  const [industry, setIndustry] = useState("Marketing & Lead Gen Agency");
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR (₹)");
  const [phone, setPhone] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) return;
    login(adminEmail, adminName);
    setStep(2);
  };

  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) return;

    createAgency({
      name: agencyName,
      industry,
      country,
      currency,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 text-white mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to FlowDesk <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {step === 1
              ? "First create your Main Administrator credentials to secure your workspace."
              : "Now configure your agency/business to start fresh with custom workflows."}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-center gap-2">
          <div
            className={`h-1.5 w-16 rounded-full transition-colors ${
              step >= 1 ? "bg-indigo-500" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 w-16 rounded-full transition-colors ${
              step >= 2 ? "bg-indigo-500" : "bg-slate-800"
            }`}
          />
        </div>

        {/* Step 1: Admin Registration */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Main Administrator Name *
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    placeholder="e.g. Aman Sharma"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type="email"
                    placeholder="e.g. aman@youragency.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-600/30 gap-1.5"
            >
              <span>Continue to Agency Setup</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Step 2: Create Agency / Organization */}
        {step === 2 && (
          <form onSubmit={handleCreateAgency} className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Agency / Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    placeholder="e.g. Apex Growth Agency"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 text-xs px-3 text-slate-200"
                  >
                    <option value="Marketing & Lead Gen Agency">Marketing / Lead Agency</option>
                    <option value="Real Estate & Infrastructure">Real Estate & Infra</option>
                    <option value="Education & EdTech">Education / EdTech</option>
                    <option value="Financial & Insurance">Financial Services</option>
                    <option value="E-commerce & Retail">E-commerce / Retail</option>
                    <option value="Healthcare & Wellness">Healthcare</option>
                    <option value="B2B SaaS & Tech">B2B SaaS / Tech</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Default Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 text-xs px-3 text-slate-200"
                  >
                    <option value="INR (₹)">INR (₹) - India</option>
                    <option value="USD ($)">USD ($) - United States</option>
                    <option value="AED (د.إ)">AED (د.إ) - UAE</option>
                    <option value="GBP (£)">GBP (£) - UK</option>
                    <option value="EUR (€)">EUR (€) - Europe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Primary WhatsApp Number (Optional)
                </label>
                <div className="relative">
                  <Send className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
              <Shield className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Your agency workspace will be initialized fresh with zero demo clutter. You will be able to invite your managers, add sales pods, and import your real leads.
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="w-1/3 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-2/3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-600/30 gap-1.5"
              >
                <Zap className="h-4 w-4" />
                <span>Launch Agency Workspace</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

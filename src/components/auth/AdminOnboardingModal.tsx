"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

function generateCaptcha(): { text: string; answer: string } {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return {
    text: `What is ${num1} + ${num2}?`,
    answer: String(num1 + num2),
  };
}

export function AdminOnboardingModal() {
  const { createAgency, login, organization } = useFlowDesk();

  // Retrieve stored organization if any
  const [storedOrg, setStoredOrg] = useState<{ name: string; joinCode: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fd_marketing_org");
      if (saved) {
        try {
          setStoredOrg(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [organization]);

  const activeOrg = organization || storedOrg;

  // Active Tab: Default to SIGNIN
  const [activeTab, setActiveTab] = useState<"SIGNIN" | "CREATE">("SIGNIN");

  // Sign In Fields
  const [signInAgencyId, setSignInAgencyId] = useState(activeOrg?.joinCode || "");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Captcha State
  const [captcha, setCaptcha] = useState<{ text: string; answer: string }>(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  // Create Agency Fields (Admin Only)
  const [agencyName, setAgencyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Feedback alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signInAgencyId.trim() || !signInEmail.trim() || !signInPassword.trim()) {
      setErrorMsg("Please enter your Agency ID, Work Email, and Password.");
      return;
    }

    if (!isValidEmail(signInEmail)) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    // Verify Captcha
    if (captchaInput.trim() !== captcha.answer) {
      setErrorMsg("Incorrect security captcha. Please solve the calculation again.");
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    const res = await login({
      agencyId: signInAgencyId,
      email: signInEmail,
      password: signInPassword,
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      refreshCaptcha();
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agencyName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setErrorMsg("Please fill in all required fields including admin password.");
      return;
    }

    if (!isValidEmail(adminEmail)) {
      setErrorMsg("Please enter a valid work email address (e.g. aman@youragency.com).");
      return;
    }

    setIsLoading(true);
    await createAgency({
      agencyName,
      adminName,
      adminEmail,
      adminPassword,
    });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 text-white mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            FlowDesk <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            Marketing Automation & Lead Management Operating System
          </p>
        </div>

        {/* Tab Switcher (ONLY Sign In & Create Agency) */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("SIGNIN");
              setErrorMsg(null);
              refreshCaptcha();
            }}
            className={`flex-1 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "SIGNIN"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("CREATE");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "CREATE"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Agency (Admin)
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM (Using Agency ID, Work Email, Password, & Captcha) */}
        {activeTab === "SIGNIN" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-3 text-xs">
              {/* Agency ID */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Agency ID / Join Code *
                </label>
                <div className="relative">
                  <Key className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    placeholder="e.g. ZER-2242 (From your Onboarding Email)"
                    value={signInAgencyId}
                    onChange={(e) => setSignInAgencyId(e.target.value.toUpperCase())}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 font-mono placeholder:text-slate-600 focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">
                    Registered Work Email *
                  </label>
                  {signInEmail && (
                    <span className={`text-[10px] font-bold ${isValidEmail(signInEmail) ? "text-emerald-400" : "text-amber-400"}`}>
                      {isValidEmail(signInEmail) ? "Valid Email ✓" : "Enter full email"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type="email"
                    placeholder="e.g. rahul@apexagency.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Password / First-Time Temporary Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="pl-9 pr-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  First-time user? Use the temporary password sent to your email. You can change it after login.
                </p>
              </div>

              {/* Interactive Security Captcha (Requested Feature) */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Security Verification (Captcha)</span>
                  </span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Refresh calculation"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-indigo-950/70 border border-indigo-800 text-indigo-200 font-mono font-bold rounded-lg text-xs select-none">
                    {captcha.text}
                  </div>
                  <Input
                    required
                    type="number"
                    placeholder="Your answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs text-center font-mono h-8"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 shadow-lg shadow-indigo-600/30 gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? "Verifying..." : "Sign In to Workspace"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* 2. CREATE AGENCY FORM (Admin Only) */}
        {activeTab === "CREATE" && (
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">
                    Admin Work Email *
                  </label>
                  {adminEmail && (
                    <span className={`text-[10px] font-bold ${isValidEmail(adminEmail) ? "text-emerald-400" : "text-amber-400"}`}>
                      {isValidEmail(adminEmail) ? "Valid Email ✓" : "Enter complete email"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type="email"
                    placeholder="e.g. aman@apexagency.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Admin Master Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type="password"
                    placeholder="Create a strong admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
              <Shield className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                As Main Admin, you will be able to create managers, assign employees, configure WhatsApp/SMTP, and manage all leads.
              </span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 shadow-lg shadow-indigo-600/30 gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? "Creating..." : "Create Agency & Launch"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

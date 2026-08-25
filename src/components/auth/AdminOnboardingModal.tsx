"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Send,
  UserPlus,
  Key,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowDesk } from "@/lib/store";

export function AdminOnboardingModal() {
  const { createAgency, joinAgency, login, organization, users } = useFlowDesk();

  const [activeTab, setActiveTab] = useState<"CREATE" | "JOIN" | "SIGNIN">(
    organization ? "SIGNIN" : "CREATE"
  );

  // Create Agency Fields
  const [agencyName, setAgencyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // Join Agency Fields
  const [joinCode, setJoinCode] = useState(organization?.joinCode || "");
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinRole, setJoinRole] = useState<"MANAGER" | "EMPLOYEE">("MANAGER");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");

  // Sign In Field
  const [signInEmail, setSignInEmail] = useState("");

  // Feedback alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const managersList = users.filter((u) => u.role === "MANAGER");

  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim() || !adminName.trim() || !adminEmail.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setErrorMsg(null);
    createAgency({
      agencyName,
      adminName,
      adminEmail,
    });
  };

  const handleJoinAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim() || !joinEmail.trim()) {
      setErrorMsg("Please enter the Agency Join Code, Name, and Email.");
      return;
    }
    setErrorMsg(null);
    const res = joinAgency({
      joinCode,
      name: joinName,
      email: joinEmail,
      role: joinRole,
      managerId: joinRole === "EMPLOYEE" ? selectedManagerId : undefined,
    });

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    setErrorMsg(null);
    const res = login(signInEmail);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
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

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
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
            Create Agency
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("JOIN");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "JOIN"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Join Agency
          </button>
          {organization && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("SIGNIN");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "SIGNIN"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
          )}
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

        {/* 1. CREATE AGENCY FORM (Admin) */}
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
                <label className="font-semibold text-slate-300 block mb-1">
                  Admin Work Email *
                </label>
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
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
              <Shield className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                As Main Admin, you will be able to create managers, assign employees, configure WhatsApp/SMTP, and manage all leads.
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 shadow-lg shadow-indigo-600/30 gap-1.5"
            >
              <span>Create Agency & Launch</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* 2. JOIN AGENCY FORM (Manager / Employee) */}
        {activeTab === "JOIN" && (
          <form onSubmit={handleJoinAgency} className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Agency Join Code *
                </label>
                <div className="relative">
                  <Key className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    placeholder="e.g. APE-4829 (Provided by your Admin)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 font-mono placeholder:text-slate-600 focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    placeholder="e.g. Rahul Kumar or Priya Patel"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Your Work Email *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type="email"
                    placeholder="e.g. rahul@apexagency.com"
                    value={joinEmail}
                    onChange={(e) => setJoinEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Select Your Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinRole("MANAGER")}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      joinRole === "MANAGER"
                        ? "border-purple-500 bg-purple-950/60 text-purple-200"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    <Briefcase className="h-4 w-4 text-purple-400" />
                    <span>Pod Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJoinRole("EMPLOYEE")}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      joinRole === "EMPLOYEE"
                        ? "border-emerald-500 bg-emerald-950/60 text-emerald-200"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    <User className="h-4 w-4 text-emerald-400" />
                    <span>Marketing Rep</span>
                  </button>
                </div>
              </div>

              {joinRole === "EMPLOYEE" && managersList.length > 0 && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Assign Reporting Manager (Optional)
                  </label>
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-800 bg-slate-950 text-xs px-3 text-slate-200"
                  >
                    <option value="">-- Select Manager --</option>
                    {managersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-600/30 gap-1.5"
            >
              <span>Join Agency Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* 3. SIGN IN FORM */}
        {activeTab === "SIGNIN" && organization && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">Current Agency:</p>
              <p className="font-bold text-slate-100 text-sm">{organization.name}</p>
              <p className="font-mono text-[11px] text-indigo-400">Join Code: {organization.joinCode}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    required
                    type="email"
                    placeholder="e.g. yourname@agency.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-600/30 gap-1.5"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
